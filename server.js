const express = require("express");
const path = require("path");
const https = require("https");
const fs = require("fs"); // NUEVO: Importamos el módulo de sistema de archivos
const usuarios = require("./usuarios.mock.json");

const app = express();
const PORT = process.env.PORT || 3000;
const HISTORIAL_PATH = path.join(__dirname, "btc-historial.json"); // Archivo persistente

app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Cargar historial inicial desde el archivo, o usar el por defecto si no existe
let btcHistorialLocal = [
  { precio: "62,041.00", cambio: "-1.24", hora: "02:00" },
  { precio: "62,110.50", cambio: "-0.85", hora: "01:57" },
  { precio: "61,980.20", cambio: "-1.40", hora: "01:54" }
];

if (fs.existsSync(HISTORIAL_PATH)) {
  try {
    btcHistorialLocal = JSON.parse(fs.readFileSync(HISTORIAL_PATH, "utf-8"));
    console.log("[SISTEMA] Historial previo cargado exitosamente desde el archivo.");
  } catch (error) {
    console.log("[SISTEMA] Error al leer el archivo de historial, usando valores por defecto.");
  }
}

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

        const nuevoRegistro = {
          precio: price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
          cambio: (change >= 0 ? "+" : "") + change.toFixed(2),
          hora: horaFormateada
        };

        btcHistorialLocal.unshift(nuevoRegistro);

        if (btcHistorialLocal.length > 10) {
          btcHistorialLocal.pop();
        }

        // NUEVO: Guardar la lista actualizada en el archivo físico JSON
        fs.writeFileSync(HISTORIAL_PATH, JSON.stringify(btcHistorialLocal, null, 2));
        console.log(`[ORÁCULO] Guardado en archivo. Nuevo precio: $${nuevoRegistro.precio} USD`);

      } catch (e) {
        console.log("[ORÁCULO] Error al procesar JSON:", e.message);
      }
    });
  }).on("error", (err) => {
    console.log("[ORÁCULO] Error de red:", err.message);
  });
}

setInterval(consultarPrecioServidor, 180000);
consultarPrecioServidor();

app.get("/api/bitcoin-historial", (req, res) => {
  res.json(btcHistorialLocal);
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.get("/api/usuarios", (req, res) => {
  res.status(200).json({ total: usuarios.length, data: usuarios });
});

app.listen(PORT, () => {
  console.log(`Servidor listo en http://localhost:${PORT}`);
});
