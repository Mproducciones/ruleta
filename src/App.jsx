// src/App.jsx
import React, { useState } from 'react';
import { IDKitWidget } from '@worldcoin/idkit';

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
      console.error("Error de conexión:", error);
      setMessage("Error de conexión. Intenta más tarde.");
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
      {isVerified ? (
        <div className="text-center p-8">
          <h1 className="text-4xl font-bold mb-4">¡Verificación Exitosa!</h1>
          <p className="text-xl mb-8">Ahora puedes jugar a la ruleta.</p>
          <img 
            src="/assets/roulette_lights_only.png" 
            alt="Ruleta" 
            className="rounded-full shadow-2xl w-64 h-64 mx-auto animate-pulse"
          />
          {/* Aquí va tu juego real */}
        </div>
      ) : (
        <div className="text-center p-8 bg-gray-800 rounded-xl shadow-2xl max-w-md">
          <h1 className="text-3xl font-bold mb-4">Ruleta Worldcoin</h1>
          <p className="text-lg mb-6 text-gray-300">{message}</p>

          <IDKitWidget
            app_id={import.meta.env.VITE_APP_ID}  // ← Usa .env
            action="login"
            signal="miniapp-ruleta-v25"
            onSuccess={() => console.log("Prueba generada")}
            handleVerify={handleVerify}
            onError={(error) => console.error("IDKit Error:", error)}
          >
            {({ open }) => (
              <button
                onClick={open}
                disabled={isVerifying}
                className={`px-8 py-4 text-lg font-bold rounded-full transition-all duration-300 ${
                  isVerifying
                    ? 'bg-gray-600 cursor-not-allowed'
                    : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg'
                }`}
              >
                {isVerifying ? 'Verificando...' : 'Conectar con Worldcoin'}
              </button>
            )}
          </IDKitWidget>
        </div>
      )}
    </div>
  );
}

export default App;