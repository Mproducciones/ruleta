// api/verify.js
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const { proof } = req.body;
  if (!proof) return res.status(400).json({ error: 'Falta proof' });

  try {
    const response = await fetch('https://developer.worldcoin.org/api/v1/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...proof,
        action: 'login',
      }),
    });

    const data = await response.json();

    if (response.ok && data.success) {
      res.status(200).json({ success: true });
    } else {
      res.status(400).json({ error: data.error || 'Verificación fallida' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error del servidor' });
  }
}