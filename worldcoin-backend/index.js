// worldcoin-backend/index.js
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const { proof, merkle_root, nullifier_hash, verification_level, signal } = req.body;

  if (!proof || !merkle_root || !nullifier_hash || !verification_level) {
    return res.status(400).json({ error: 'Faltan parámetros en la prueba' });
  }

  try {
    // Endpoint v2.5+ (usa tu nuevo app_id en la URL)
    const verifyUrl = `https://developer.worldcoin.org/api/v2/verify/app_staging_TU_NUEVO_APP_ID_AQUI`;
    const verifyRes = await fetch(verifyUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        proof,
        merkle_root,
        nullifier_hash,
        verification_level,
        action: 'login',
        signal: signal || '',  // ← Nuevo: Incluye el signal del frontend
      }),
    });

    const verifyData = await verifyRes.json();

    if (verifyRes.ok && verifyData.success) {
      // Opcional: Guarda nullifier_hash en DB (Vercel Postgres) para anti-reuso
      console.log("Verificación v25 exitosa");
      return res.status(200).json({ success: true });
    } else {
      return res.status(400).json({ error: verifyData.code || 'Verificación fallida (v25)' });
    }
  } catch (error) {
    console.error('Error en verificación v25:', error);
    return res.status(500).json({ error: 'Error del servidor' });
  }
}