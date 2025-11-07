// api/verify.js
const fetch = require('node-fetch');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const { proof, merkle_root, nullifier_hash, verification_level, signal } = req.body;

  if (!proof || !merkle_root || !nullifier_hash || !verification_level) {
    return res.status(400).json({ error: 'Faltan parámetros en la prueba' });
  }

  const appId = process.env.APP_ID;
  if (!appId) {
    console.error('APP_ID no está configurado en Vercel');
    return res.status(500).json({ error: 'Configuración del servidor incompleta' });
  }

  try {
    const verifyUrl = `https://developer.worldcoin.org/api/v2/verify/${appId}`;

    const verifyRes = await fetch(verifyUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        proof,
        merkle_root,
        nullifier_hash,
        verification_level,
        action: 'login',
        signal: signal || '',
      }),
    });

    const data = await verifyRes.json();

    if (verifyRes.ok && data.success) {
      return res.status(200).json({ success: true });
    } else {
      console.error('Verificación fallida:', data);
      return res.status(400).json({ error: data.code || 'Verificación fallida' });
    }
  } catch (error) {
    console.error('Error en verificación:', error);
    return res.status(500).json({ error: 'Error del servidor' });
  }
};