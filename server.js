const express = require("express");
const path = require("path");
const https = require("https"); 
const usuarios = require("./usuarios.mock.json");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Estructura JSON en memoria: Lista fija de los últimos 10 precios
let btcHistorialLocal = [
  { precio: "62,041.00", cambio: "-1.24", hora: "02:00" },
  { precio: "62,110.50", cambio: "-0.85", hora: "01:57" },
  { precio: "61,980.20", cambio: "-1.40", hora: "01:54" }
];

function consultarPrecioServidor() {
  https.get('https://coincap.io', (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
      try {
        const json = JSON.parse(data);
        const price = parseFloat(json.data.priceUsd);
        const change = parseFloat(json.data.changePercent24Hr);
        
        const ahora = new Date();
        const horaFormateada = ahora.toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Caracas' });
        
        // Creamos el nuevo nodo JSON
        const nuevoRegistro = {
          precio: price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
          cambio: (change >= 0 ? "+" : "") + change.toFixed(2),
          hora: horaFormateada
        };
        
        // Empujamos al inicio de la lista
        btcHistorialLocal.unshift(nuevoRegistro);
        
        // Regla matemática: si supera los 10 registros, eliminamos el último (el más viejo)
        if (btcHistorialLocal.length > 10) {
          btcHistorialLocal.pop();
        }
        
        console.log(`[ORÁCULO] Nuevo registro añadido al historial JSON: $${nuevoRegistro.precio} USD`);
      } catch (e) {
        console.log("[ORÁCULO] Error al procesar JSON de CoinCap.");
      }
    });
  }).on("error", (err) => {
    console.log("[ORÁCULO] Error de red en el servidor.");
  });
}

// El servidor actualiza el historial cada 3 minutos
setInterval(consultarPrecioServidor, 180000);
consultarPrecioServidor(); 

// NUEVO ENDPOINT: Sirve el arreglo completo de 10 objetos JSON
app.get("/api/bitcoin-historial", (req, res) => {
  res.json(btcHistorialLocal);
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.get("/api/usuarios", (req, res) => {
  res.status(200).json({
    total: usuarios.length,
    data: usuarios,
  });
});

app.listen(PORT, () => {
  console.log(`Servidor listo en http://localhost:${PORT}`);
});
