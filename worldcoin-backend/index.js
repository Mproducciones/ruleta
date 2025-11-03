// IMPORTANTE: Esta es una función Serverless (Lambda) compatible con Vercel.
// Eliminamos Express ya que no es necesario para una simple verificación por fetch.

// Se usa el 'fetch' global de Node.js en Vercel, no se necesita la importación 'node-fetch'.

// **MEJORA**: Usa la variable de entorno WORLDCOIN_APP_ID en Vercel para mayor seguridad.
// Si no está definida, usa el valor por defecto que proporcionaste.
const APP_ID = process.env.WORLDCOIN_APP_ID || "app_d1ea58fce8cb903e9be8b8dbf34da3a2";

// Exportamos la función para que Vercel la reconozca como una función sin servidor
export default async function handler(req, res) {
    // Vercel ya maneja CORS y el parseo de JSON, pero la validación de método es buena.
    if (req.method !== 'POST') {
        return res.status(405).json({ message: "Método no permitido. Solo se acepta POST." });
    }

    try {
        // En Vercel, el cuerpo de la petición ya está disponible en req.body
        const { proof, nullifier_hash, merkle_root, signal } = req.body;

        // Llamada directa a la API de Worldcoin (v2)
        const response = await fetch("https://developer.worldcoin.org/api/v2/verify", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                app_id: APP_ID, 
                action: "login", // Asegúrate de que esta acción coincida con tu IDKit widget en el frontend
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
            // Respuesta de error de Worldcoin
            res.status(400).json({ ok: false, error: data, message: data.detail || "Verificación fallida." });
        }
    } catch (err) {
        console.error("❌ Error en el servidor:", err);
        // Error interno de la función Serverless
        res.status(500).json({ ok: false, message: "Error interno del servidor", error: err.message });
    }
}
