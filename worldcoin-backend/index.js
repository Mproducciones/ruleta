// Este es el formato ES Module estándar para una Serverless Function de Vercel.
// Usamos el 'fetch' nativo de Node.js (disponible en el runtime de Vercel).

// **MEJORA**: Usa la variable de entorno WORLDCOIN_APP_ID en Vercel para mayor seguridad.
const APP_ID = process.env.WORLDCOIN_APP_ID || "app_d1ea58fce8cb903e9be8b8dbf34da3a2";

// Exportamos la función para que Vercel la reconozca como una función Serverless (Lambda).
export default async function handler(req, res) {
    console.log("🔥 Vercel Function Handler Iniciado (ESM mode).");

    if (req.method !== 'POST') {
        return res.status(405).json({ message: "Method Not Allowed. Only POST is accepted." });
    }

    // Vercel Serverless Functions parsea automáticamente el cuerpo JSON.
    const { proof, nullifier_hash, merkle_root, signal } = req.body || {};

    if (!proof || !nullifier_hash || !merkle_root) {
        console.error("❌ Datos de prueba incompletos.");
        return res.status(400).json({ ok: false, message: "Missing required Worldcoin proof parameters." });
    }

    try {
        // Usamos el 'fetch' nativo, ya que Vercel garantiza su disponibilidad en Node.js.
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

        if (response.ok) { // Comprobar si la respuesta HTTP de Worldcoin es 2xx
            if (data.success) {
                res.status(200).json({ ok: true, data });
            } else {
                // Worldcoin API devolvió un resultado fallido, devolvemos 400.
                res.status(400).json({ ok: false, error: data, message: data.detail || "Verificación fallida por Worldcoin." });
            }
        } else {
            // Error de la API de Worldcoin (4xx o 5xx)
             res.status(response.status).json({ ok: false, error: data, message: `Worldcoin API returned status ${response.status}.` });
        }

    } catch (err) {
        console.error("❌ Error en el servidor al ejecutar fetch:", err);
        // Error interno de la función Serverless (ej. problemas de red)
        res.status(500).json({ ok: false, message: "Internal Server Error during verification call.", error: err.message });
    }
}
