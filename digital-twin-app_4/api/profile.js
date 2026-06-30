// api/profile.js — Vercel Serverless Function
// Сохраняет профиль пользователя в Supabase (бесплатная база данных)

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { userId, traits, step } = req.body;
  if (!userId) return res.status(400).json({ error: 'userId required' });

  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_KEY = process.env.SUPABASE_KEY;

  if (!SUPABASE_URL || !SUPABASE_KEY) {
    // Если Supabase ещё не подключён — просто отвечаем успехом, ничего не теряем
    return res.status(200).json({ ok: true, saved: false, note: 'Supabase not configured yet' });
  }

  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/profiles`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Prefer': 'resolution=merge-duplicates'
      },
      body: JSON.stringify({ user_id: userId, traits, step, updated_at: new Date().toISOString() })
    });

    if (!response.ok) throw new Error(await response.text());
    res.status(200).json({ ok: true, saved: true });
  } catch (error) {
    console.error('Supabase error:', error);
    res.status(200).json({ ok: true, saved: false, error: error.message });
  }
}
