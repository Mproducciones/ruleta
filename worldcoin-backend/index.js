// IMPORTANTE: Esta es una función Serverless (Lambda) compatible con Vercel.
// Utiliza el formato `module.exports` para la máxima compatibilidad con el runtime de Vercel.

// **MEJORA**: Usa la variable de entorno WORLDCOIN_APP_ID en Vercel para mayor seguridad.
// Si no está definida, usa el valor por defecto que proporcionaste.
const APP_ID = process.env.WORLDCOIN_APP_ID || "app_d1ea58fce8cb903e9be8b8dbf34da3a2";

// Exportamos la función handler usando module.exports. Vercel espera un handler que reciba req y res.
module.exports = async (req, res) => {
    console.log("🔥 Vercel Function Handler Iniciado.");

    if (req.method !== 'POST') {
        // Aunque la ruta está configurada para solo manejar API, siempre es bueno validar.
        return res.status(405).json({ message: "Method Not Allowed. Only POST is accepted." });
    }

    // Vercel Serverless Functions parsea automáticamente el cuerpo JSON.
    const { proof, nullifier_hash, merkle_root, signal } = req.body || {};

    // Validación básica de datos
    if (!proof || !nullifier_hash || !merkle_root) {
        return res.status(400).json({ ok: false, message: "Missing required Worldcoin proof parameters." });
    }

    try {
        // Llamada directa a la API de Worldcoin (v2)
        const response = await fetch("https://developer.worldcoin.org/api/v2/verify", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                app_id: APP_ID, 
                action: "login", 
                signal: signal || "default-signal",
                proof,
                nullifier_hash,
                merkle_root
            }),
        });

        const data = await response.json();
        console.log("🔎 Respuesta de Worldcoin:", data);

        if (data.success) {
            // Respuesta exitosa
            res.status(200).json({ ok: true, data });
        } else {
            // Error de verificación de Worldcoin
            // Devolvemos 400 (Bad Request) porque la solicitud es válida, pero la prueba falló.
            res.status(400).json({ ok: false, error: data, message: data.detail || "Verificación fallida por Worldcoin." });
        }
    } catch (err) {
        console.error("❌ Error en el servidor al ejecutar fetch:", err);
        // Error interno de la función Serverless (ej. problemas de red, DNS, etc.)
        res.status(500).json({ ok: false, message: "Internal Server Error during verification call.", error: err.message });
    }
};
