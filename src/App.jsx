// src/App.jsx
import React, { useState } from 'react';
import { IDKitWidget } from '@worldcoin/idkit';

function App() {
  const [isVerified, setIsVerified] = useState(true);
  const [isVerifying, setIsVerifying] = useState(false);
  const [message, setMessage] = useState("Verifica tu identidad para jugar.");

  const handleVerify = async (result) => {
    setIsVerifying(true);
    setMessage("Verificando con el servidor...");

    try {
      const res = await fetch('/api/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(result),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setIsVerified(true);
        setMessage("¡Verificación exitosa!");
      } else {
        setMessage(data.error || "Falló verificación");
      }
    } catch (err) {
      setMessage("Error de red");
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
      {isVerified ? (
        <div className="text-center p-8">
          <h1 className="text-4xl font-bold mb-4">¡Verificado!</h1>
          <p className="text-xl mb-8">Juega a la ruleta</p>
          <img src="/assets/roulette_lights_only.png" className="w-64 h-64 rounded-full shadow-2xl mx-auto" />
        </div>
      ) : (
        <div className="text-center p-8 bg-gray-800 rounded-xl max-w-md">
          <h1 className="text-3xl font-bold mb-4">Ruleta Worldcoin</h1>
          <p className="mb-6 text-gray-300">{message}</p>

          <IDKitWidget
            app_id={import.meta.env.VITE_APP_ID}
            action="login"
            signal="miniapp-ruleta-v25"
            handleVerify={handleVerify}
            onError={(e) => console.error("IDKit Error:", e)}
          >
            {({ open }) => (
              <button
                onClick={open}
                disabled={isVerifying}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 px-8 py-4 rounded-full font-bold text-lg shadow-lg"
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