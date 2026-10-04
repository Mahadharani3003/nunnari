import { NextResponse } from 'next/server';
import { runAgent } from '@/lib/ai/agent';
import { ChatRequest } from '@/types/chat';

export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const body = await request.json() as ChatRequest;

    if (!body || !body.messages || !Array.isArray(body.messages) || body.messages.length === 0) {
      return NextResponse.json(
        { error: 'Invalid request: messages array is required and cannot be empty.' },
        { status: 400 }
      );
    }

    // Limit maximum message length to avoid abuse
    const MAX_LENGTH = 10000;
    const isTooLong = body.messages.some(m => m.content && m.content.length > MAX_LENGTH);
    if (isTooLong) {
      return NextResponse.json(
        { error: 'Invalid request: message length exceeds the maximum limit.' },
        { status: 400 }
      );
    }

    const encoder = new TextEncoder();
    
    const stream = new ReadableStream({
      async start(controller) {
        const emit = (type: string, data: unknown) => {
          try {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type, data })}\n\n`));
          } catch (e) {
            // Stream might be closed
          }
        };

        try {
          await runAgent(body.messages, emit);
        } catch (error: unknown) {
          console.error('Agent Error:', error);
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          if (errorMessage === 'GEMINI_API_KEY is not configured.') {
            emit('error', 'GEMINI_API_KEY is not configured on the server.');
          } else {
            emit('error', errorMessage || 'Something went wrong while contacting Nunnari. Please try again.');
          }
        } finally {
          try {
            controller.close();
          } catch (e) {}
        }
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      }
    });
  } catch (error: unknown) {
    console.error('Chat API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error.' },
      { status: 500 }
    );
  }
}
