const fetch = require("node-fetch");

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  try {
    const { merkle_root, nullifier_hash, proof, credential_type, signal } = req.body;

    if (!merkle_root || !nullifier_hash || !proof) {
      return res.status(400).json({ error: "Datos incompletos" });
    }

    const response = await fetch("https://developer.worldcoin.org/api/v1/verify", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.WORLDCOIN_API_KEY}`,
      },
      body: JSON.stringify({
        action: "verificacion_juego",
        signal,
        merkle_root,
        nullifier_hash,
        proof,
        credential_type,
      }),
    });

    const data = await response.json();

    if (response.ok && data.success) {
      console.log("✅ Verificación Worldcoin exitosa");
      return res.status(200).json({ success: true });
    } else {
      console.error("❌ Error al verificar:", data);
      return res.status(400).json({ success: false, error: data });
    }
  } catch (err) {
    console.error("❌ Error del servidor:", err);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
};
