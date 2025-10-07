import { NextRequest, NextResponse } from 'next/server';
import { PeriodProcessor } from '@/lib/jobs/period-processor';

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const expectedAuth = `Bearer ${process.env.CRON_SECRET}`;
    
    if (!process.env.CRON_SECRET) {
      return NextResponse.json({ 
        error: 'Server configuration error' 
      }, { status: 500 });
    }

    if (authHeader !== expectedAuth) {
      return NextResponse.json({ 
        error: 'Unauthorized' 
      }, { status: 401 });
    }

    const processor = new PeriodProcessor();
    const result = await processor.processPreviousPeriod();

    return NextResponse.json(result);

  } catch (error) {
    console.error('Period processing error:', error);
    return NextResponse.json({
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ 
    message: 'NFT period processing endpoint',
    status: 'ready'
  });
}