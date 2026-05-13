const express = require("express");
const path = require("path");
const usuarios = require("./usuarios.mock.json");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname)));

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
