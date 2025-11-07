import React, { useState } from 'react';
import { IDKitWidget } from '@worldcoin/idkit';  // Ya actualizado

function App() {
  const [isVerified, setIsVerified] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [message, setMessage] = useState("Verifica tu identidad para jugar a la ruleta.");

  const handleVerify = async (result) => {
    setIsVerifying(true);
    setMessage("Verificando con el servidor...");

    try {
      const response = await fetch('/api/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(result),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setIsVerified(true);
        setMessage("¡Verificación exitosa!");
      } else {
        setMessage(data.error || "Verificación falló. Intenta de nuevo.");
      }
    } catch (error) {
      console.error("Error:", error);
      setMessage("Error de conexión. Verifica tu backend.");
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
      {isVerified ? (
        <div className="game-screen text-center p-8 bg-gray-900 min-h-screen text-white flex flex-col items-center justify-center">
          <h1 className="text-4xl font-bold mb-4">¡Verificación Exitosa!</h1>
          <p className="text-xl mb-8">Ahora puedes jugar a la ruleta.</p>
          <img 
            src="/assets/roulette_lights_only.png" 
            alt="Ruleta del Juego" 
            className="rounded-full shadow-lg w-64 h-64" 
          />
          {/* Integra aquí tu componente de ruleta con framer-motion */}
        </div>
      ) : (
        <div className="text-center p-8 bg-gray-800 rounded-lg shadow-xl">
          <h1 className="text-3xl font-bold mb-4">Bienvenido a la Ruleta</h1>
          <p className="text-lg mb-6 text-gray-400">{message}</p>
          
          <IDKitWidget
            app_id="app_7ec06caed3f34cbacd2ffaa7569655f6"  // ← Nuevo app_id de IDKit
            action="login"  // Coincide con backend
            signal="user-login-ruleta-v25"  // ← Nuevo: Mejora privacidad (hash del usuario)
            onSuccess={(proof) => console.log("Prueba generada:", proof)}
            handleVerify={handleVerify}
            // Opcional: theme="light" para UI personalizada
          >
            {({ open }) => (
              <button
                onClick={open}
                disabled={isVerifying}
                className={`px-6 py-3 font-semibold rounded-full transition-colors duration-300 ${
                  isVerifying ? 'bg-gray-500 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'
                }`}
              >
                {isVerifying ? 'Verificando...' : 'Conectarse con Worldcoin (IDKit)'}
              </button>
            )}
          </IDKitWidget>
        </div>
      )}
    </div>
  );
}

export default App;