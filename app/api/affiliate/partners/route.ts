import { NextRequest, NextResponse } from 'next/server';
import { lazyAdminDb } from '@/lib/supabase/admin';
const supabase = lazyAdminDb();

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category');

    let query = supabase
      .from('bv_affiliate_partners')
      .select(`
        id,
        partner_name,
        partner_slug,
        category,
        description,
        logo_url,
        website_url,
        affiliate_url,
        commission_rate,
        cookie_duration_days,
        avg_order_value,
        rating,
        features,
        badge,
        status
      `)
      .eq('status', 'active')
      .order('rating', { ascending: false });

    if (category) {
      query = query.eq('category', category);
    }

    const { data, error } = await query;

    if (error) throw error;

    // Group by category for the frontend
    const grouped = (data || []).reduce((acc, partner) => {
      const cat = partner.category;
      if (!acc[cat]) {
        acc[cat] = [];
      }
      acc[cat].push(partner);
      return acc;
    }, {} as Record<string, typeof data>);

    return NextResponse.json({
      partners: data,
      byCategory: grouped,
      total: data?.length || 0
    });

  } catch (error) {
    console.error('Error fetching affiliate partners:', error);
    return NextResponse.json(
      { error: 'Failed to fetch partners' },
      { status: 500 }
    );
  }
}

// Admin endpoint to add/update partners

function requireAdmin(request: Request): Response | null {
  const secret = process.env.ADMIN_API_SECRET ?? '';
  if (!secret) {
    return new Response(JSON.stringify({ error: 'Not configured.', code: 'NOT_CONFIGURED' }),
      { status: 503, headers: { 'content-type': 'application/json' } });
  }
  const given = request.headers.get('x-admin-secret') ?? '';
  const a = Buffer.from(given);
  const b = Buffer.from(secret);
  const ok = a.length === b.length && require('node:crypto').timingSafeEqual(a, b);
  return ok ? null : new Response(JSON.stringify({ error: 'Forbidden', code: 'ADMIN_ONLY' }),
    { status: 403, headers: { 'content-type': 'application/json' } });
}

export async function POST(request: NextRequest) {
  // 2026-09-07: this let anybody register or OVERWRITE an affiliate partner.
  //
  // The upsert takes partner_slug and affiliate_url from the body. Upsert means
  // a slug that already exists is replaced, so a stranger could point an
  // existing partner's affiliate_url at their own link and take the commission
  // on every click that follows - silently, because the partner still looks
  // right in the list.
  //
  // The guard called this WARN rather than CRITICAL because no id is read from
  // the request. The slug IS the id here.
  const denied = requireAdmin(request);
  if (denied) return denied;

  try {
    // Check for admin authorization
    const authHeader = request.headers.get('authorization');
    const adminKey = process.env.ADMIN_API_KEY;
    
    if (!authHeader || authHeader !== `Bearer ${adminKey}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    
    const {
      partner_name,
      partner_slug,
      category,
      description,
      logo_url,
      website_url,
      affiliate_url,
      affiliate_network,
      affiliate_id,
      commission_rate,
      commission_type,
      cookie_duration_days,
      avg_order_value,
      rating,
      features,
      badge,
      status,
      terms_url,
      notes
    } = body;

    // Validate required fields
    if (!partner_name || !partner_slug || !category || !affiliate_url) {
      return NextResponse.json(
        { error: 'Missing required fields: partner_name, partner_slug, category, affiliate_url' },
        { status: 400 }
      );
    }

    // Upsert partner (insert or update on conflict)
    const { data, error } = await supabase
      .from('bv_affiliate_partners')
      .upsert({
        partner_name,
        partner_slug,
        category,
        description,
        logo_url,
        website_url,
        affiliate_url,
        affiliate_network,
        affiliate_id,
        commission_rate,
        commission_type: commission_type || 'percentage',
        cookie_duration_days,
        avg_order_value,
        rating,
        features,
        badge,
        status: status || 'active',
        terms_url,
        notes,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'partner_slug'
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      partner: data
    });

  } catch (error) {
    console.error('Error saving partner:', error);
    return NextResponse.json(
      { error: 'Failed to save partner' },
      { status: 500 }
    );
  }
}
