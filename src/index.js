export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if ((url.pathname.endsWith('/api/humanize') || url.pathname.endsWith('/api/humanize/')) && request.method === 'POST') {
      // 限流：以 IP 为键，每 60 秒最多 30 次
      const ip = request.headers.get('cf-connecting-ip') || 'unknown';
      const { success } = await env.AI_RATE_LIMITER.limit({ key: 'humanize:' + ip });

      if (!success) {
        return json({
          error: 'Too many requests. Please wait a minute and try again.',
          code: 'RATE_LIMITED'
        }, 429);
      }

      return handleHumanize(request, env);
    }

    return env.ASSETS.fetch(request);
  }
};

const TONE_PROMPTS = {
  natural: 'Rewrite the following text so it sounds like a natural human wrote it. Vary sentence length. Remove clichés, corporate buzzwords, and phrases that sound AI-generated (like "delve", "tapestry", "in today\'s fast-paced world"). Keep the same meaning and approximate length.',
  casual: 'Rewrite the following text in a casual, conversational tone. Use contractions. Keep it friendly and approachable, like you are talking to a friend. Keep the same meaning.',
  professional: 'Rewrite the following text in a clear, professional tone. Be concise and direct. Avoid buzzwords and filler. Keep the same meaning.'
};

async function handleHumanize(request, env) {
  try {
    const body = await request.json();
    const text = (body.text || '').trim();
    const tone = body.tone || 'natural';

    if (text.length < 20) {
      return json({ error: 'Text must be at least 20 characters.' }, 400);
    }

    const MAX_CHARS = 3000;
    const input = text.length > MAX_CHARS ? text.slice(0, MAX_CHARS) : text;

    const systemPrompt = 'You are a professional text editor. You only return the rewritten text, with no explanations, no quotes, and no preamble.';
    const userPrompt = TONE_PROMPTS[tone] + '\n\nText:\n' + input;

    const response = await env.AI.run('@cf/meta/llama-3.2-3b-instruct', {
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      max_tokens: 1200,
      temperature: 0.7
    });

    const output = (response.response || '').trim();

    if (!output) {
      return json({ error: 'Model returned empty output. Please try again.' }, 500);
    }

    return json({ output: output });
  } catch (err) {
    console.error('AI error:', err);
    return json({ error: 'Processing failed. Please try again in a moment.' }, 500);
  }
}

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8' }
  });
}
