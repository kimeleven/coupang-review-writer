'use server';

import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.warn('GEMINI_API_KEY is not set in environment variables.');
}

const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

export async function generateReviewWithGemini(prompt: string): Promise<{ title: string; content: string }> {
  if (!genAI) {
    throw new Error('Gemini API 키가 설정되지 않았습니다. Vercel 환경변수에 GEMINI_API_KEY를 추가해주세요.');
  }

  const model = genAI.getGenerativeModel({ 
    model: 'gemini-1.5-flash',  // Free tier friendly, fast and good at Korean
    generationConfig: {
      temperature: 0.75,
      maxOutputTokens: 4096,
    }
  });

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();

  // Simple parsing: Assume first line is title if it looks like one
  const lines = text.trim().split('\n');
  let title = lines[0].replace(/^#+\s*/, '').trim();
  let content = text;

  // If title is too long, fallback
  if (title.length > 100) {
    title = lines.find((l: string) => l.trim().length > 10 && l.trim().length < 80) || '상품 리뷰';
  }

  return { title, content };
}
