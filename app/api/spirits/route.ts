import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Create Supabase client with anon key for public read access
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Category image mapping for display
const categoryImages: Record<string, string> = {
  bourbon: 'https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=400',
  scotch: 'https://images.unsplash.com/photo-1527281400683-1aae777175f8?w=400',
  wine: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=400',
  beer: 'https://images.unsplash.com/photo-1535958636474-b021ee887b13?w=400',
  rum: 'https://images.unsplash.com/photo-1614313511387-1436a4480ebb?w=400',
  tequila: 'https://images.unsplash.com/photo-1516535794938-6063878f08cc?w=400',
  vodka: 'https://images.unsplash.com/photo-1607622750671-6cd9a99eabd1?w=400',
  gin: 'https://images.unsplash.com/photo-1608885898957-a559228e8749?w=400',
  cognac: 'https://images.unsplash.com/photo-1619451050621-83cb7aada2d7?w=400',
  brandy: 'https://images.unsplash.com/photo-1619451050621-83cb7aada2d7?w=400',
  mezcal: 'https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=400',
  sake: 'https://images.unsplash.com/photo-1553361371-9b22f78e8b1d?w=400',
  rye: 'https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=400',
  irish: 'https://images.unsplash.com/photo-1527281400683-1aae777175f8?w=400',
  japanese: 'https://images.unsplash.com/photo-1527281400683-1aae777175f8?w=400',
  other: 'https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=400',
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const sortBy = searchParams.get('sortBy') || 'name';
    const sortOrder = searchParams.get('sortOrder') || 'asc';
    
    const offset = (page - 1) * limit;

    // Build query
    let query = supabase
      .from('bv_spirits')
      .select('*', { count: 'exact' });

    // Apply category filter
    if (category && category !== 'all') {
      query = query.eq('category', category);
    }

    // Apply search filter
    if (search) {
      query = query.or(`name.ilike.%${search}%,brand.ilike.%${search}%,distillery.ilike.%${search}%`);
    }

    // Apply sorting
    const validSortFields = ['name', 'msrp', 'proof', 'category', 'created_at'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'name';
    query = query.order(sortField, { ascending: sortOrder === 'asc' });

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data: spirits, error, count } = await query;

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }

    // Add fallback images for spirits without images
    const spiritsWithImages = (spirits || []).map(spirit => ({
      ...spirit,
      image_url: spirit.image_url || categoryImages[spirit.category] || categoryImages.bourbon,
      thumbnail_url: spirit.thumbnail_url || categoryImages[spirit.category] || categoryImages.bourbon,
    }));

    // Get category counts
    const { data: categoryCounts } = await supabase
      .from('bv_spirits')
      .select('category');

    const counts: Record<string, number> = {};
    (categoryCounts || []).forEach((item: { category: string }) => {
      counts[item.category] = (counts[item.category] || 0) + 1;
    });

    return NextResponse.json({
      spirits: spiritsWithImages,
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit),
      categoryCounts: counts,
    });
  } catch (error) {
    console.error('Error fetching spirits:', error);
    
    // Return error response
    return NextResponse.json(
      { 
        error: 'Failed to fetch spirits',
        spirits: [],
        total: 0,
        page: 1,
        limit: 12,
        totalPages: 0,
        categoryCounts: {},
      },
      { status: 500 }
    );
  }
}
