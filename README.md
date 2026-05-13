# Dashboard de Usuarios con Mock Data

Aplicacion web sencilla que muestra un dashboard visual con tarjetas de usuarios ficticios cargados desde una API mock construida con Express.

## Que hace este proyecto

- Sirve una pagina web estatica con HTML, CSS y JavaScript vanilla.
- Expone un endpoint `GET /api/usuarios` con datos mock en formato JSON.
- Consume ese endpoint desde el frontend para renderizar tarjetas de usuarios.
- Incluye una seccion visual con carrusel de imagenes y diseno responsive basico.

## Tecnologias usadas

- Node.js
- Express
- Vanilla JavaScript (frontend)
- HTML5 y CSS3

## Como ejecutar localmente

1. Instala dependencias:

```bash
npm install
```

2. Inicia el servidor:

```bash
npm start
```

3. Abre en el navegador:

`http://localhost:3000`

## Estructura general

- `server.js`: servidor Express y rutas API.
- `usuarios.mock.json`: datos de usuarios ficticios.
- `index.html`: estructura de la interfaz.
- `styles.css`: estilos del dashboard.
- `script.js`: logica del carrusel y consumo de la API.

## Nota para despliegue

El frontend consume la API con ruta relativa (`/api/usuarios`), por lo que funciona tanto en local como en entornos desplegados (por ejemplo, Render) sin cambios adicionales de URL.

## Capturas

Puedes agregar tus screenshots en una carpeta `screenshots/` para que se vean en GitHub:

```md
![Vista principal del dashboard](screenshots/dashboard-home.png)
![Seccion de usuarios](screenshots/dashboard-usuarios.png)
```

Sugerencia de archivos:

- `screenshots/dashboard-home.png`
- `screenshots/dashboard-usuarios.png`

## Licencia

Este proyecto esta bajo la licencia MIT. Revisa el archivo `LICENSE` para mas detalles.
