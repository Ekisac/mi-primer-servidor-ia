const express = require("express");
const path = require("path");
const https = require("https");
const usuarios = require("./usuarios.mock.json");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Guardamos solo un objeto con el precio actual en memoria
let btcPrecioActual = { precio: "62,041.00", cambio: "-1.24", hora: "--:--" };

function consultarPrecioServidor() {
  https.get('https://coincap.io', (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
      try {
        const json = JSON.parse(data);
        if (!json.data) throw new Error("Estructura inválida");

        const price = parseFloat(json.data.priceUsd);
        const change = parseFloat(json.data.changePercent24Hr);
        const ahora = new Date();
        const horaFormateada = ahora.toLocaleTimeString('es-VE', { 
          hour: '2-digit', minute: '2-digit', timeZone: 'America/Caracas' 
        });

        // Sobrescribimos el objeto con el dato más reciente
        btcPrecioActual = {
          precio: price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
          cambio: (change >= 0 ? "+" : "") + change.toFixed(2),
          hora: horaFormateada
        };

        console.log(`[ORÁCULO] Precio actualizado: $${btcPrecioActual.precio} USD`);
      } catch (e) {
        console.log("[ORÁCULO] Error al procesar JSON:", e.message);
      }
    });
  }).on("error", (err) => {
    console.log("[ORÁCULO] Error de red:", err.message);
  });
}

// El servidor consulta el precio cada 3 minutos
setInterval(consultarPrecioServidor, 180000);
consultarPrecioServidor();

// ENDPOINT MODIFICADO: Ahora solo devuelve el objeto del precio actual
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
