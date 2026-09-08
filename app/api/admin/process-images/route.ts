import { readBody, boundedInt } from '@/lib/api/body';
import { NextRequest, NextResponse } from 'next/server';
import { lazyAdminDb } from '@/lib/supabase/admin';
import { secretKey, supabaseUrl } from "@craudioviz/platform-sdk";
const SUPABASE_URL = supabaseUrl();
const supabaseServiceKey = secretKey();

const supabase = lazyAdminDb();

const BUCKET_NAME = 'spirit-images';

// Verified working official images
const VERIFIED_IMAGES: Record<string, string> = {
  'buffalo trace': 'https://wordpress-1508494-5786922.cloudwaysapps.com/wp-content/uploads/2025/11/BUFFALO_TRACE_BOTTLE-e1765117225509.png',
  'blanton': 'https://wordpress-1508494-5786922.cloudwaysapps.com/wp-content/uploads/2025/12/BLANTONS.png',
  'eagle rare': 'https://wordpress-1508494-5786922.cloudwaysapps.com/wp-content/uploads/2025/12/BOTTLE-EAGLE-RARE.png',
  'weller': 'https://wordpress-1508494-5786922.cloudwaysapps.com/wp-content/uploads/2025/11/WELLER-SPECIAL-RESERVE-PACKSHOT-PRODUCT-e1764158017233.png',
  'e.h. taylor': 'https://wordpress-1508494-5786922.cloudwaysapps.com/wp-content/uploads/2025/11/E.H.TAYLOR_SINGLE_BARREL_BOTTLE.png',
  'taylor': 'https://wordpress-1508494-5786922.cloudwaysapps.com/wp-content/uploads/2025/11/E.H.TAYLOR_SINGLE_BARREL_BOTTLE.png',
  'sazerac': 'https://wordpress-1508494-5786922.cloudwaysapps.com/wp-content/uploads/2025/11/Sazerac-Rye-Pack-Shot.png',
  'van winkle': 'https://wordpress-1508494-5786922.cloudwaysapps.com/wp-content/uploads/2025/11/OLD_-RIP_VAN_WINKLE_10_B0TTLE.png',
  'pappy': 'https://wordpress-1508494-5786922.cloudwaysapps.com/wp-content/uploads/2025/11/OLD_-RIP_VAN_WINKLE_10_B0TTLE.png',
  'traveller': 'https://wordpress-1508494-5786922.cloudwaysapps.com/wp-content/uploads/2025/11/TRAVELLER_BOTTLE.png',
  'michter': 'https://michters.com/wp-content/uploads/2025/01/BOURB750_418x1378100_2023.jpg',
};

function findVerifiedImage(name: string, brand: string): string | null {
  const searchStr = `${name} ${brand}`.toLowerCase();
  for (const [pattern, url] of Object.entries(VERIFIED_IMAGES)) {
    if (searchStr.includes(pattern)) {
      return url;
    }
  }
  return null;
}

async function validateUrl(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch {
    return false;
  }
}

async function downloadAndUpload(imageUrl: string, spiritId: string): Promise<string | null> {
  try {
    // Download image
    const response = await fetch(imageUrl);
    if (!response.ok) return null;
    
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Upload to Supabase Storage
    const filename = `${spiritId}.jpg`;
    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filename, buffer, {
        contentType: 'image/jpeg',
        upsert: true
      });
    
    if (error) {
      console.error('Upload error:', error);
      return null;
    }
    
    return `${SUPABASE_URL}/storage/v1/object/public/${BUCKET_NAME}/${filename}`;
  } catch (error) {
    console.error('Download/upload error:', error);
    return null;
  }
}


/**
 * 2026-09-07: this route had NO authentication of any kind.
 *
 * It sits under /api/admin and rewrites the spirits catalogue - importing,
 * scraping and overwriting images across 1.5 million rows. Anyone who found the
 * path could run it, repeatedly, and each run costs money and changes data.
 *
 * The check that found it called it "anonymous, costly and unlimited" and
 * suggested a rate limit. A rate limit on an unauthenticated admin endpoint
 * makes it slower to abuse, not harder. The defect was the missing gate.
 */
function requireAdmin(request: Request): Response | null {
  const secret = process.env.ADMIN_API_SECRET ?? '';
  if (!secret) {
    // No fallback to a literal. An unset secret refuses rather than opens.
    return new Response(
      JSON.stringify({ error: 'Not configured.', code: 'NOT_CONFIGURED' }),
      { status: 503, headers: { 'content-type': 'application/json' } },
    );
  }
  const given = request.headers.get('x-admin-secret') ?? '';
  const a = Buffer.from(given);
  const b = Buffer.from(secret);
  const ok = a.length === b.length && require('node:crypto').timingSafeEqual(a, b);
  if (!ok) {
    return new Response(
      JSON.stringify({ error: 'Forbidden', code: 'ADMIN_ONLY' }),
      { status: 403, headers: { 'content-type': 'application/json' } },
    );
  }
  return null;
}

export async function POST(request: NextRequest) {
  const denied = requireAdmin(request);
  if (denied) return denied;

  try {
    const parsed = await readBody<Record<string, unknown>>(request);
    if (!parsed.ok) return parsed.response;

    // 2026-09-07: batchSize and offset came straight from the body with only a
    // default. A default is not a bound - the caller can send any number, and
    // batchSize 1000000 is a valid number and an unavailable service. This route
    // processes images, so each unit is real work against a 1.5 million row
    // table.
    const batchSize = boundedInt(parsed.body.batchSize, { fallback: 50, min: 1, max: 200 });
    const offset = boundedInt(parsed.body.offset, { fallback: 0, min: 0, max: 5_000_000 });
    
    // Ensure bucket exists
    const { data: buckets } = await supabase.storage.listBuckets();
    if (!buckets?.some(b => b.name === BUCKET_NAME)) {
      await supabase.storage.createBucket(BUCKET_NAME, { public: true });
    }
    
    // Fetch batch of spirits
    const { data: spirits, error } = await supabase
      .from('bv_spirits')
      .select('id, name, brand, image_url')
      .range(offset, offset + batchSize - 1);
    
    if (error) {
      return NextResponse.json({ error: 'The request could not be completed.', code: 'INTERNAL_ERROR' }, { status: 500 });
    }
    
    const results = {
      processed: 0,
      uploaded: 0,
      failed: 0,
      skipped: 0,
      updates: [] as { id: string; newUrl: string }[]
    };
    
    for (const spirit of spirits || []) {
      results.processed++;
      
      // Find best image URL
      let imageUrl = findVerifiedImage(spirit.name || '', spirit.brand || '');
      
      if (!imageUrl && spirit.image_url) {
        const isValid = await validateUrl(spirit.image_url);
        if (isValid) imageUrl = spirit.image_url;
      }
      
      if (!imageUrl) {
        results.skipped++;
        continue;
      }
      
      // Download and upload
      const newUrl = await downloadAndUpload(imageUrl, spirit.id);
      
      if (newUrl) {
        results.uploaded++;
        results.updates.push({ id: spirit.id, newUrl });
        
        // Update database
        await supabase
          .from('bv_spirits')
          .update({ image_url: newUrl, thumbnail_url: newUrl })
          .eq('id', spirit.id);
      } else {
        results.failed++;
      }
    }
    
    return NextResponse.json({
      success: true,
      ...results,
      nextOffset: offset + batchSize,
      hasMore: (spirits?.length || 0) === batchSize
    });
    
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// GET to check status
export async function GET() {
  const { count } = await supabase
    .from('bv_spirits')
    .select('*', { count: 'exact', head: true });
  
  const { data: files } = await supabase.storage
    .from(BUCKET_NAME)
    .list();
  
  return NextResponse.json({
    totalSpirits: count,
    imagesUploaded: files?.length || 0,
    bucketUrl: `${SUPABASE_URL}/storage/v1/object/public/${BUCKET_NAME}/`
  });
}
