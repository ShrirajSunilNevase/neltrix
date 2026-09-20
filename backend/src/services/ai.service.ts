import OpenAI from "openai";

export async function analyzeWithAI(prompt: string, context: unknown) {
  if (!process.env.OPENAI_API_KEY) {
    return {
      mode: "demo",
      answer: `Demo AI Analyst: Based on the supplied market context, review momentum, volume, volatility and nearby support/resistance before drawing conclusions. This is contextual analysis, not guaranteed financial advice.`,
      context
    };
  }

  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const response = await client.responses.create({
    model: "gpt-4o-mini",
    input: [
      {
        role: "system",
        content: "You are Neltrix AI Analyst. Explain market data clearly and neutrally. Do not present output as guaranteed financial advice or guaranteed price prediction."
      },
      {
        role: "user",
        content: `${prompt}\n\nMarket context:\n${JSON.stringify(context)}`
      }
    ]
  });

  return { mode: "live", answer: response.output_text };
}
