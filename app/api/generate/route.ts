import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    const apiKey = process.env.AI_KEY;
    
    if (!apiKey) {
      return NextResponse.json({ error: 'API key is missing' }, { status: 500 });
    }

    const ai = new GoogleGenAI({ apiKey });

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: `${prompt}

      CRITICAL INSTRUCTIONS FOR FORMATTING:
      - You MUST return ONLY valid semantic HTML (e.g., <h1>, <h2>, <ul>, <li>, <strong>, <em>, <p>, <br>).
      - Do NOT use ANY Markdown syntax (like **, #, or *).
      - Do NOT wrap your response in markdown code blocks. Just return the raw HTML string directly.`,
    });

    return NextResponse.json({ text: response.text });
  } catch (error: any) {
    console.error("AI Generation Error:", error);
    return NextResponse.json({ error: 'Failed to generate content' }, { status: 500 });
  }
}
