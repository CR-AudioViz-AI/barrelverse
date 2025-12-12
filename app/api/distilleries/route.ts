import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const region = searchParams.get('region');
    const country = searchParams.get('country');
    const search = searchParams.get('search');
    const distilleryId = searchParams.get('id');
    const limit = parseInt(searchParams.get('limit') || '50');

    // Get single distillery
    if (distilleryId) {
      const { data, error } = await supabase
        .from('bv_distilleries')
        .select('*')
        .eq('id', distilleryId)
        .single();

      if (error) throw error;

      return NextResponse.json({
        success: true,
        distillery: data
      });
    }

    // List distilleries
    let query = supabase
      .from('bv_distilleries')
      .select('*')
      .order('name');

    if (region && region !== 'all') {
      query = query.eq('region', region);
    }

    if (country && country !== 'all') {
      query = query.eq('country', country);
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,location.ilike.%${search}%`);
    }

    const { data, error } = await query.limit(limit);

    if (error) throw error;

    // Get unique regions
    const { data: regions } = await supabase
      .from('bv_distilleries')
      .select('region')
      .not('region', 'is', null)
      .order('region');

    const uniqueRegions = [...new Set(regions?.map(r => r.region).filter(Boolean) || [])];

    return NextResponse.json({
      success: true,
      distilleries: data || [],
      count: data?.length || 0,
      regions: uniqueRegions
    });
  } catch (error) {
    console.error('Distilleries API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch distilleries' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, distilleryId, action } = body;

    if (!userId || !distilleryId) {
      return NextResponse.json(
        { success: false, error: 'User ID and Distillery ID required' },
        { status: 400 }
      );
    }

    if (action === 'visit') {
      // Record distillery visit (passport feature)
      const { data, error } = await supabase
        .from('bv_distillery_visits')
        .insert({
          user_id: userId,
          distillery_id: distilleryId,
          visited_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        if (error.code === '23505') {
          return NextResponse.json({
            success: true,
            message: 'Already visited'
          });
        }
        throw error;
      }

      // Award proof points for visit
      await supabase.rpc('add_proof_points', {
        p_user_id: userId,
        p_points: 25,
        p_reason: 'Distillery visit recorded'
      });

      return NextResponse.json({
        success: true,
        visit: data,
        proofAwarded: 25
      });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Distillery action error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process action' },
      { status: 500 }
    );
  }
}
