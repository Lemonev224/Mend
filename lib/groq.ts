import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function generateMendMessage({ customerName, amount, currency }: any) {
  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are a helpful SaaS founder. A customer's payment failed. Write a very short, empathetic email (2-3 sentences). Don't sound like a debt collector. Sound like a friend checking in because their card might have expired. No subject line, just body."
        },
        {
          role: "user",
          content: `Customer: ${customerName}, Amount: ${amount} ${currency}.`
        }
      ],
      model: "llama-3.3-70b-versatile", // Updated model
      temperature: 0.7,
      max_tokens: 150
    });

    return completion.choices[0]?.message?.content || `Hi ${customerName}, just a quick heads-up that your payment for $${amount} ${currency} didn't go through. It's usually just an expired card — you can update it here when you have a moment.`;
  } catch (error) {
    console.error('Groq API error:', error);
    return `Hi ${customerName}, just a quick heads-up that your payment for $${amount} ${currency} didn't go through. It's usually just an expired card — you can update it here when you have a moment.`;
  }
}