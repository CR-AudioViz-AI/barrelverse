import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Use service role key to bypass RLS
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = (page - 1) * limit

    let query = supabase
      .from('bv_spirits')
      .select('*', { count: 'exact' })

    // Filter by category
    if (category && category !== 'all') {
      query = query.eq('category', category.toLowerCase())
    }

    // Search by name
    if (search) {
      query = query.ilike('name', `%${search}%`)
    }

    // Pagination
    query = query.range(offset, offset + limit - 1)
    
    // Order by rating desc
    query = query.order('rating', { ascending: false })

    const { data, error, count } = await query

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Get category counts
    const { data: allSpirits } = await supabase
      .from('bv_spirits')
      .select('category')

    const categoryCounts: Record<string, number> = {}
    if (allSpirits) {
      allSpirits.forEach(spirit => {
        const cat = spirit.category || 'other'
        categoryCounts[cat] = (categoryCounts[cat] || 0) + 1
      })
    }

    return NextResponse.json({
      spirits: data || [],
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit),
      categoryCounts
    })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch spirits' },
      { status: 500 }
    )
  }
}
