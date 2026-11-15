import { NextRequest, NextResponse } from 'next/server';
import { AstraAiAssistant } from '@/lib/ai-assistant';

const assistant = new AstraAiAssistant();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt, astronautId } = body;

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json({ success: false, error: 'Prompt is required' }, { status: 400 });
    }

    const response = await assistant.answerQuery(prompt, astronautId || 'AST-0421');

    return NextResponse.json({ success: true, message: response });
  } catch (error: any) {
    console.error('ASTRA AI error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
