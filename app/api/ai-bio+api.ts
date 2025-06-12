import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: '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',
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, age, interests, intent } = body;

    const prompt = `Write a compelling dating app bio for ${name}, age ${age}, who is looking for ${intent}. Their interests include: ${interests.join(', ')}. 

The bio should be:
- Authentic and engaging
- 2-3 sentences maximum
- Show personality and humor
- Mention 1-2 key interests naturally
- Be appropriate for a dating/friendship app

Return only the bio text, no quotes or extra formatting.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a creative writer specializing in dating app profiles. Write engaging, authentic bios that help people connect.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      max_tokens: 150,
      temperature: 0.8,
    });

    const bio = completion.choices[0]?.message?.content?.trim();

    if (!bio) {
      return new Response(JSON.stringify({ error: 'Failed to generate bio' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ bio }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('AI Bio generation error:', error);
    return new Response(JSON.stringify({ error: 'Failed to generate bio' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}