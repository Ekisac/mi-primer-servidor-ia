const express = require("express");
const path = require("path");
const usuarios = require("./usuarios.mock.json");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Variables del juego en memoria del servidor
let numeroSecreto = Math.floor(Math.random() * 100) + 1;
let intentosMaximos = 7;

// Endpoint para procesar el intento del jugador
app.post("/api/juego-adivinar", (req, res) => {
  const { numero } = req.body;
  const suposicion = parseInt(numero);

  if (isNaN(suposicion)) {
    return res.status(400).json({ mensaje: "Por favor, introduce un número válido." });
  }

  if (suposicion === numeroSecreto) {
    // Si gana, reiniciamos el número para la próxima partida
    numeroSecreto = Math.floor(Math.random() * 100) + 1;
    return res.json({ estado: "ganado", mensaje: "¡BRUTAL! Has hackeado el sistema. El número era correcto. Se ha generado uno nuevo." });
  } else if (suposicion < numeroSecreto) {
    return res.json({ estado: "pista", mensaje: "El número secreto es MÁS ALTO ↑" });
  } else {
    return res.json({ estado: "pista", mensaje: "El número secreto es MÁS BAJO ↓" });
  }
});

// Endpoint por si el jugador quiere reiniciar manualmente
app.post("/api/juego-reiniciar", (req, res) => {
  numeroSecreto = Math.floor(Math.random() * 100) + 1;
  res.json({ mensaje: "Sistema reiniciado. Nuevo número generado entre 1 y 100." });
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
