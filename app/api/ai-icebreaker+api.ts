import OpenAI from 'openai';
import { databaseService } from '@/lib/database';

const openai = new OpenAI({
  apiKey: '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',
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { match_user_id } = body;

    // Get the matched user's profile
    const { data: matchedUser, error } = await databaseService.getUserById(match_user_id);
    
    if (error || !matchedUser) {
      return new Response(JSON.stringify({ error: 'User not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const prompt = `Generate a creative icebreaker message for someone named ${matchedUser.name} who is ${matchedUser.age} years old. Their interests include: ${matchedUser.interests.join(', ')}. ${matchedUser.bio ? `Their bio says: "${matchedUser.bio}"` : ''}

The icebreaker should be:
- Friendly and engaging
- Reference one of their interests or bio naturally
- Be a conversation starter
- Not too long (1-2 sentences)
- Appropriate for a dating/friendship app

Return only the message text, no quotes or extra formatting.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a dating coach helping people write engaging first messages. Create personalized icebreakers that feel natural and start conversations.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      max_tokens: 100,
      temperature: 0.9,
    });

    const icebreaker = completion.choices[0]?.message?.content?.trim();

    if (!icebreaker) {
      return new Response(JSON.stringify({ error: 'Failed to generate icebreaker' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ icebreaker }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('AI Icebreaker generation error:', error);
    return new Response(JSON.stringify({ error: 'Failed to generate icebreaker' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}