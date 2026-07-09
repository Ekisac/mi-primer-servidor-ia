const express = require("express");
const path = require("path");
const https = require("https");
const usuarios = require("./usuarios.mock.json");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Guardamos el estado inicial
let btcPrecioActual = { precio: "Cargando...", cambio: "0.00", hora: "--:--" };

function consultarPrecioServidor() {
  const opciones = {
    hostname: '://coingecko.com',
    path: '/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true',
    method: 'GET',
    headers: {
      'User-Agent': 'NodeJS-Server' // Header vital para que las APIs de criptos acepten la petición de Render
    }
  };

  https.get(opciones, (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
      try {
        const json = JSON.parse(data);
        
        // Validamos que CoinGecko nos devuelva los datos correctos
        if (!json.bitcoin) throw new Error("Respuesta incompleta de la API");

        const price = json.bitcoin.usd;
        const change = json.bitcoin.usd_24h_change;
        const ahora = new Date();
        const horaFormateada = ahora.toLocaleTimeString('es-VE', { 
          hour: '2-digit', minute: '2-digit', timeZone: 'America/Caracas' 
        });

        // Guardamos los datos reales procesados con éxito
        btcPrecioActual = {
          precio: price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
          cambio: (change >= 0 ? "+" : "") + change.toFixed(2),
          hora: horaFormateada
        };

        console.log(`[ORÁCULO] Precio Real CoinGecko: $${btcPrecioActual.precio} USD`);
      } catch (e) {
        btcPrecioActual = { precio: "Error de Datos", cambio: "0.00", hora: "--:--" };
        console.log("[ORÁCULO] Error al procesar JSON:", e.message);
      }
    });
  }).on("error", (err) => {
    btcPrecioActual = { precio: "Error de Red", cambio: "0.00", hora: "--:--" };
    console.log("[ORÁCULO] Error de red:", err.message);
  });
}

// Actualizar cada 3 minutos
setInterval(consultarPrecioServidor, 180000);
consultarPrecioServidor();

app.get("/api/bitcoin-actual", (req, res) => {
  res.json(btcPrecioActual);
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "cripto.html"));
});

app.get("/api/usuarios", (req, res) => {
  res.status(200).json({ total: usuarios.length, data: usuarios });
});

app.listen(PORT, () => {
  console.log(`Servidor listo en http://localhost:${PORT}`);
});
