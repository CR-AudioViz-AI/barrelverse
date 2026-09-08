import { readBody } from '@/lib/api/body';
import { NextRequest, NextResponse } from 'next/server';
import { lazyAdminDb } from '@/lib/supabase/admin';
import { secretKey, supabaseUrl } from "@craudioviz/platform-sdk";
const SUPABASE_URL = supabaseUrl();
const SUPABASE_SERVICE_KEY = secretKey();
const supabase = lazyAdminDb();

interface ImageResult {
  url: string;
  thumbnail_url?: string;
  source: string;
  license: string;
  attribution: string;
  source_url: string;
  width?: number;
  height?: number;
}

async function searchWikimedia(spiritName: string, brand?: string): Promise<ImageResult[]> {
  const searchTerms = brand ? `${brand} ${spiritName} bottle` : `${spiritName} bottle whiskey`;
  try {
    const response = await fetch(
      `https://commons.wikimedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(searchTerms)}&srnamespace=6&srlimit=3&format=json&origin=*`,
      { headers: { 'User-Agent': 'Javari Spirits/1.0' } }
    );
    if (!response.ok) return [];
    const data = await response.json();
    const results: ImageResult[] = [];
    for (const item of (data.query?.search || []).slice(0, 2)) {
      const imageInfo = await getWikiImageInfo(item.title);
      if (imageInfo) results.push(imageInfo);
    }
    return results;
  } catch (e) { console.error('Wikimedia error:', e); return []; }
}

async function getWikiImageInfo(fileTitle: string): Promise<ImageResult | null> {
  try {
    const response = await fetch(
      `https://commons.wikimedia.org/w/api.php?action=query&titles=${encodeURIComponent(fileTitle)}&prop=imageinfo&iiprop=url|size&format=json&origin=*`,
      { headers: { 'User-Agent': 'Javari Spirits/1.0' } }
    );
    if (!response.ok) return null;
    const data = await response.json();
    const page = Object.values(data.query?.pages || {})[0] as any;
    if (!page?.imageinfo?.[0]) return null;
    const info = page.imageinfo[0];
    return {
      url: info.url,
      thumbnail_url: info.thumburl || info.url,
      source: 'wikimedia',
      license: 'cc-by-sa',
      attribution: 'Wikimedia Commons',
      source_url: `https://commons.wikimedia.org/wiki/${encodeURIComponent(fileTitle)}`,
      width: info.width,
      height: info.height
    };
  } catch { return null; }
}

async function saveImageToDb(spiritId: string, image: ImageResult, isPrimary: boolean): Promise<string | null> {
  try {
    const { data, error } = await supabase.from('spirit_images').insert({
      spirit_id: spiritId,
      url: image.url,
      thumbnail_url: image.thumbnail_url || null,
      source: image.source || 'wikimedia',
      license: image.license || 'cc-by-sa',
      attribution_required: true,
      attribution_text: image.attribution || 'Wikimedia Commons',
      source_url: image.source_url || '',
      width: image.width || null,
      height: image.height || null,
      status: 'approved',
      is_primary: isPrimary
    }).select('id').single();
    
    if (error) {
      console.error('Insert error:', error);
      return null;
    }
    return data?.id || null;
  } catch (e) {
    console.error('Save error:', e);
    return null;
  }
}

async function updateSpiritImage(spiritId: string, imageId: string) {
  try {
    await supabase.from('bv_spirits').update({ primary_image_id: imageId }).eq('id', spiritId);
  } catch (e) {
    console.error('Update spirit error:', e);
  }
}

function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)); }


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
    const body = parsed.body as any;
    const limit = Math.min(body.limit || 30, 50);

    const { data: spirits, error } = await supabase
      .from('bv_spirits')
      .select('id, name, brand')
      .is('primary_image_id', null)
      .limit(limit);
      
    if (error) return NextResponse.json({ error: 'The request could not be completed.', code: 'INTERNAL_ERROR' }, { status: 500 });

    const results = { processed: 0, imagesFound: 0, imagesSaved: 0, spiritsWithImages: 0, errors: [] as string[] };

    for (const spirit of spirits || []) {
      results.processed++;
      try {
        await sleep(1500);
        const images = await searchWikimedia(spirit.name, spirit.brand);
        results.imagesFound += images.length;
        
        if (images.length > 0) {
          const imageId = await saveImageToDb(spirit.id, images[0], true);
          if (imageId) {
            results.imagesSaved++;
            results.spiritsWithImages++;
            await updateSpiritImage(spirit.id, imageId);
          }
        }
      } catch (e: any) { 
        results.errors.push(`${spirit.name}: ${e.message}`); 
      }
    }
    return NextResponse.json({ success: true, message: `Processed ${results.processed} spirits`, results });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function GET() {
  const { count: total } = await supabase.from('bv_spirits').select('*', { count: 'exact', head: true });
  const { count: withImages } = await supabase.from('bv_spirits').select('*', { count: 'exact', head: true }).not('primary_image_id', 'is', null);
  return NextResponse.json({
    total_spirits: total || 0,
    with_images: withImages || 0,
    without_images: (total || 0) - (withImages || 0),
    coverage_percent: total ? ((withImages || 0) / total * 100).toFixed(1) : 0
  });
}
