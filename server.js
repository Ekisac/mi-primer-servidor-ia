const express = require("express");
const path = require("path");
const https = require("https"); // Módulo nativo para hacer peticiones seguras
const usuarios = require("./usuarios.mock.json");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Memoria caché local del servidor
let btcDataLocal = { precio: "62,041.00", cambio: "-1.24" };

// Función autónoma del servidor para recolectar datos sin pasar por el navegador
function consultarPrecioServidor() {
  https.get('https://coincap.io', (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
      try {
        const json = JSON.parse(data);
        const price = parseFloat(json.data.priceUsd);
        const change = parseFloat(json.data.changePercent24Hr);
        
        btcDataLocal.precio = price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        btcDataLocal.cambio = (change >= 0 ? "+" : "") + change.toFixed(2);
        console.log(`[ORÁCULO] Precio actualizado en Render: $${btcDataLocal.precio} USD`);
      } catch (e) {
        console.log("[ORÁCULO] Error al procesar JSON de CoinCap.");
      }
    });
  }).on("error", (err) => {
    console.log("[ORÁCULO] Error de red en el servidor, manteniendo caché.");
  });
}

// El servidor consulta la API cada 3 minutos en segundo plano
setInterval(consultarPrecioServidor, 180000);
consultarPrecioServidor(); // Primera carga al encender

// ENTRADAS DE LA API LOCAL (Inmunes a bloqueos CORS / CSP)
app.get("/api/bitcoin-local", (req, res) => {
  res.json(btcDataLocal);
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
