import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 5 minutes max for Vercel Pro

const BATCH_SIZE = 100;
const API_URL = process.env.VERCEL_URL 
  ? `https://${process.env.VERCEL_URL}/api/images/process`
  : 'http://localhost:3000/api/images/process';


/**
 * 2026-09-07: a cron route anyone could trigger.
 *
 * Vercel sends CRON_SECRET as a bearer token on scheduled invocations. Without
 * checking it, this endpoint processes images in batches of 100 for anybody who
 * requests it - and it is declared maxDuration 300, so each call holds a
 * function for five minutes.
 */
function requireCron(request: Request): Response | null {
  const secret = process.env.CRON_SECRET ?? '';
  if (!secret) {
    return new Response(
      JSON.stringify({ error: 'Not configured.', code: 'NOT_CONFIGURED' }),
      { status: 503, headers: { 'content-type': 'application/json' } },
    );
  }
  if (request.headers.get('authorization') !== `Bearer ${secret}`) {
    return new Response(
      JSON.stringify({ error: 'Forbidden', code: 'CRON_ONLY' }),
      { status: 403, headers: { 'content-type': 'application/json' } },
    );
  }
  return null;
}

export async function GET(request: Request) {
  const denied = requireCron(request);
  if (denied) return denied;

  const startTime = Date.now();
  const results: any[] = [];
  let offset = 0;
  let complete = false;
  let totalProcessed = 0;
  let totalFailed = 0;
  
  console.log('🖼️ Starting automated image processing cron job...');
  
  // Process multiple batches within the time limit
  while (!complete && (Date.now() - startTime) < 270000) { // Leave 30s buffer
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ batchSize: BATCH_SIZE, offset })
      });
      
      const result = await response.json();
      results.push(result);
      
      totalProcessed += result.processed || 0;
      totalFailed += result.failed || 0;
      offset = result.nextOffset || offset + BATCH_SIZE;
      complete = result.complete || false;
      
      console.log(`Batch complete: ${result.processed} processed, offset now ${offset}`);
      
      if (result.processed === 0 && result.failed === 0) {
        // No more to process
        break;
      }
      
    } catch (error: any) {
      console.error('Batch error:', error.message);
      results.push({ error: 'The request could not be completed.', code: 'INTERNAL_ERROR' });
      break;
    }
  }
  
  const duration = Math.round((Date.now() - startTime) / 1000);
  
  return NextResponse.json({
    message: complete ? 'All images processed!' : 'Partial processing complete (will continue next run)',
    duration: `${duration}s`,
    totalProcessed,
    totalFailed,
    batchesRun: results.length,
    complete
  });
}
