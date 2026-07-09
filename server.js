const express = require("express");
const path = require("path");
const https = require("https");
const usuarios = require("./usuarios.mock.json");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Iniciamos en vacío para verificar si la API responde realmente
let btcPrecioActual = { precio: "Cargando...", cambio: "0.00", hora: "--:--" };

function consultarPrecioServidor() {
  // Cambiamos a la API de Binance (BTCUSDT) que no bloquea a Render
  https.get('https://binance.com', (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
      try {
        const json = JSON.parse(data);
        
        // Binance devuelve directamente lastPrice y priceChangePercent
        if (!json.lastPrice) throw new Error("Respuesta incompleta de Binance");

        const price = parseFloat(json.lastPrice);
        const change = parseFloat(json.priceChangePercent);
        const ahora = new Date();
        const horaFormateada = ahora.toLocaleTimeString('es-VE', { 
          hour: '2-digit', minute: '2-digit', timeZone: 'America/Caracas' 
        });

        // Guardamos los datos reales procesados
        btcPrecioActual = {
          precio: price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
          cambio: (change >= 0 ? "+" : "") + change.toFixed(2),
          hora: horaFormateada
        };

        console.log(`[ORÁCULO] Precio Real Binance: $${btcPrecioActual.precio} USD`);
      } catch (e) {
        console.log("[ORÁCULO] Error al procesar JSON de Binance:", e.message);
      }
    });
  }).on("error", (err) => {
    console.log("[ORÁCULO] Error de red en Binance:", err.message);
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
