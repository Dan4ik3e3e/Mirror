// api/analyze.js — Vercel Serverless Function (Groq version — FREE)
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { userId, history, step, total } = req.body;
  if (!history || !history.length) return res.status(400).json({ error: 'history required' });

  const isLastQuestion = step + 1 >= total;

  const systemPrompt = `Ты — психолог-аналитик, который ведёт глубинное интервью с человеком, чтобы построить точную модель его личности для проекта "Цифровой двойник".

Используй идеи из признанных психологических подходов: модель Big Five, теория привязанности, когнитивные искажения, локус контроля. Не называй эти термины напрямую — говори как проницательный собеседник.

ТВОЯ ЗАДАЧА на шаге ${step + 1} из ${total}:
1. Коротко отреагируй на последний ответ — покажи что услышал что-то конкретное.
2. ${isLastQuestion ? 'Это последний вопрос фазы — заверши тёплым проницательным комментарием, не задавай новый вопрос.' : 'Задай ОДИН новый открытый вопрос, логически вытекающий из того что сказал человек.'}

Отвечай ТОЛЬКО в формате JSON без markdown:
{"nextMessage": "текст по-русски, 2-4 предложения", "newTraits": ["черта 1", "черта 2"]}

newTraits — 1-2 коротких психологических наблюдения (2-4 слова). Если сложно определить — верни [].`;

  const messages = [
    { role: 'system', content: systemPrompt },
    ...history.map(m => ({ role: m.role === 'twin' ? 'assistant' : 'user', content: m.content }))
  ];

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        max_tokens: 500,
        response_format: { type: 'json_object' },
        messages
      })
    });

    const data = await response.json();
    console.log('Groq response:', JSON.stringify(data));

    if (data.error) {
      return res.status(200).json({ nextMessage: `Ошибка: ${data.error.message}`, newTraits: [] });
    }

    const rawText = data.choices?.[0]?.message?.content || '';
    let parsed = null;
    try {
      parsed = JSON.parse(rawText.replace(/```json|```/g, '').trim());
    } catch (e) {
      const match = rawText.match(/\{[\s\S]*\}/);
      if (match) try { parsed = JSON.parse(match[0]); } catch (e2) {}
    }

    if (!parsed) parsed = { nextMessage: rawText || 'Расскажи мне больше.', newTraits: [] };

    res.status(200).json({
      nextMessage: parsed.nextMessage || 'Расскажи мне больше.',
      newTraits: parsed.newTraits || []
    });
  } catch (error) {
    console.error('Groq error:', error.message);
    res.status(200).json({ nextMessage: `Ошибка: ${error.message}`, newTraits: [] });
  }
}
