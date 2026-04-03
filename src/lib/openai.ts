import OpenAI from 'openai'

// Global client for fallback/testing — BYOK users supply keys per-request in chat route
export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY ?? 'placeholder',
})
