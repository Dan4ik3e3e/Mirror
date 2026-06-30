// api/chat.js — Vercel Serverless Function (Groq version — FREE)
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { userId, message, traits } = req.body;
  if (!message) return res.status(400).json({ error: 'message required' });

  const traitsText = (traits && traits.length) ? traits.join(', ') : 'пока мало информации';

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        max_tokens: 400,
        messages: [
          {
            role: 'system',
            content: `Ты — Цифровой Двойник пользователя, модель его личности построенная на психологическом анализе.
Известные наблюдения о пользователе: ${traitsText}.
Говори от первого лица как его внутренний голос — точно, честно, иногда провокационно.
Не давай прямых советов. Задавай встречные вопросы. Отражай паттерны которые человек сам не замечает.
Отвечай по-русски, коротко (2-4 предложения), без вводных слов вроде "Конечно".`
          },
          { role: 'user', content: message }
        ]
      })
    });

    const data = await response.json();
    console.log('Groq chat response:', JSON.stringify(data));

    if (data.error) {
      return res.status(200).json({ reply: `Ошибка: ${data.error.message}` });
    }

    const reply = data.choices?.[0]?.message?.content || 'Думаю над этим...';
    res.status(200).json({ reply });
  } catch (error) {
    console.error('Groq chat error:', error.message);
    res.status(200).json({ reply: `Ошибка: ${error.message}` });
  }
}
