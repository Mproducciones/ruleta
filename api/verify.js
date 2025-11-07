// api/verify.js
const fetch = require('node-fetch');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' });

  const { proof, merkle_root, nullifier_hash, verification_level, signal } = req.body;
  if (!proof || !merkle_root || !nullifier_hash || !verification_level) {
    return res.status(400).json({ error: 'Faltan parámetros' });
  }

  const appId = process.env.APP_ID;
  if (!appId) return res.status(500).json({ error: 'APP_ID no configurado en Vercel' });

  try {
    const verifyRes = await fetch(`https://developer.worldcoin.org/api/v2/verify/${appId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        proof,
        merkle_root,
        nullifier_hash,
        verification_level,
        action: 'login',
        signal: signal || 'miniapp-ruleta-v25',
      }),
    });

    const data = await verifyRes.json();
    if (verifyRes.ok && data.success) {
      return res.status(200).json({ success: true });
    } else {
      return res.status(400).json({ error: data.code || 'Falló verificación' });
    }
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: 'Error del servidor' });
  }
};