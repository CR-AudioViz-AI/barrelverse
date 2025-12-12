import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { score, total, proofEarned, category, userId } = body;

    const { data: session, error } = await supabase
      .from('bv_game_sessions')
      .insert({
        user_id: userId || null,
        game_type: 'trivia',
        score,
        max_score: total,
        proof_earned: proofEarned,
        metadata: { category },
        completed_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Session save error:', error);
    }

    return NextResponse.json({ success: true, sessionId: session?.id, proofEarned });
  } catch (error) {
    console.error('Complete game error:', error);
    return NextResponse.json({ error: 'Failed to save game results' }, { status: 500 });
  }
}
