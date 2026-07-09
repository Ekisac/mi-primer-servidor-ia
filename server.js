const express = require("express");
const path = require("path");
const https = require("https");
const usuarios = require("./usuarios.mock.json");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Endpoint que actúa como Proxy interno
app.get("/api/bitcoin-actual", (req, proxyRes) => {
  // Usamos la API de Coinbase que es amigable con servidores en la nube
  https.get('https://coinbase.com', (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
      try {
        const json = JSON.parse(data);
        if (!json.data || !json.data.amount) throw new Error("Estructura inválida");

        const price = parseFloat(json.data.amount);
        const ahora = new Date();
        const horaFormateada = ahora.toLocaleTimeString('es-VE', { 
          hour: '2-digit', minute: '2-digit', timeZone: 'America/Caracas' 
        });

        // Respondemos al navegador con el JSON limpio
        proxyRes.json({
          precio: price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
          cambio: "+0.00", // Coinbase Spot no da el cambio de 24h directamente, fijamos base estable
          hora: horaFormateada
        });
      } catch (e) {
        proxyRes.status(500).json({ error: "Error al procesar datos" });
      }
    });
  }).on("error", (err) => {
    proxyRes.status(500).json({ error: "Error de conexión con el proveedor" });
  });
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
