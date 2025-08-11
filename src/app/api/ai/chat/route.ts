import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import crypto from 'crypto';

type ChatMessage = {
  role: 'user' | 'assistant' | 'system';
  content: string;
};

// Simple in-memory cache for demo purposes
// In production, consider Redis or database-based caching
const responseCache = new Map<string, { reply: string; timestamp: number }>();
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

// Generate cache key from user's question
function generateCacheKey(messages: ChatMessage[]): string {
  const userMessages = messages.filter(m => m.role === 'user').map(m => m.content.toLowerCase().trim());
  return crypto.createHash('md5').update(userMessages.join('|')).digest('hex');
}

// Check if cached response is still valid
function isCacheValid(timestamp: number): boolean {
  return Date.now() - timestamp < CACHE_TTL;
}

export async function POST(req: Request) {
  console.log('🚀 AI Chat API called');
  
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.error('❌ OPENAI_API_KEY not found in environment variables');
      return NextResponse.json(
        { error: 'Server misconfiguration: OPENAI_API_KEY is not set.' },
        { status: 500 }
      );
    }
    
    console.log('✅ API key found, length:', apiKey.length);

    const body = await req.json().catch((err) => {
      console.error('❌ Failed to parse request body:', err);
      return {};
    });
    
    const messages = (body?.messages ?? []) as ChatMessage[];
    console.log('📨 Received messages:', messages.length, 'total');

    const sanitizedMessages: ChatMessage[] = messages
      .filter((m) => m && typeof m.content === 'string' && (m.role === 'user' || m.role === 'assistant'))
      .slice(-12);
    
    console.log('🧹 Sanitized messages:', sanitizedMessages.length, 'messages');

    // Check cache first
    const cacheKey = generateCacheKey(sanitizedMessages);
    const cachedResponse = responseCache.get(cacheKey);
    
    if (cachedResponse && isCacheValid(cachedResponse.timestamp)) {
      console.log('💾 Serving cached response');
      return NextResponse.json({ reply: cachedResponse.reply });
    }

    const systemMessage: ChatMessage = {
      role: 'system',
      content:
        'You are a youth sports injury prevention and recovery assistant. Provide safe, medically cautious guidance in under 150 words. Focus on general best practices, not personalized medical advice. Always recommend consulting healthcare professionals for specific concerns. Keep responses concise, supportive, and educational. Use bullet points when possible. Topics: prevention, recovery, return-to-play, stretching, concussion safety, hydration, nutrition, mental health.',
    };

    console.log('🤖 Initializing OpenAI client...');
    const client = new OpenAI({ apiKey });
    
    console.log('📤 Sending request to OpenAI...');
    const response = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0.3, // Lower temperature for more consistent, focused responses
      max_tokens: 200, // Limit output to keep responses concise
      messages: [systemMessage, ...sanitizedMessages],
    });

    console.log('✅ OpenAI response received');
    const reply = response.choices?.[0]?.message?.content?.trim();
    
    if (!reply) {
      console.warn('⚠️ No content in OpenAI response');
      return NextResponse.json({ 
        reply: 'Sorry, I could not generate a response. Please try again.' 
      });
    }
    
    // Cache the response
    responseCache.set(cacheKey, { reply, timestamp: Date.now() });
    console.log('💾 Response cached, cache size:', responseCache.size);
    
    // Clean up old cache entries periodically
    if (responseCache.size > 100) {
      const now = Date.now();
      for (const [key, value] of responseCache.entries()) {
        if (!isCacheValid(value.timestamp)) {
          responseCache.delete(key);
        }
      }
      console.log('🧹 Cache cleaned, new size:', responseCache.size);
    }
    
    console.log('💬 Generated reply length:', reply.length);
    return NextResponse.json({ reply });
    
  } catch (error) {
    console.error('❌ AI chat error:', error);
    
    if (error instanceof Error) {
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
    }
    
    return NextResponse.json(
      { error: 'An unexpected error occurred. Check server logs for details.' },
      { status: 500 }
    );
  }
}


