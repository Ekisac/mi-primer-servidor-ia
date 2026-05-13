function initCarousel() {
  const carousel = document.getElementById("tech-carousel");
  if (!carousel) return;

  const cards = Array.from(carousel.querySelectorAll(".tech-card"));
  const controls = document.querySelectorAll(".carousel-control");
  let currentIndex = 0;
  let intervalId = null;

  function showCard(index) {
    if (!cards.length) return;
    currentIndex = (index + cards.length) % cards.length;
    const targetCard = cards[currentIndex];
    carousel.scrollTo({
      left: targetCard.offsetLeft - carousel.offsetLeft,
      behavior: "smooth",
    });
  }

  function startAutoplay() {
    stopAutoplay();
    intervalId = setInterval(() => showCard(currentIndex + 1), 3000);
  }

  function stopAutoplay() {
    if (intervalId) clearInterval(intervalId);
  }

  controls.forEach((button) => {
    button.addEventListener("click", () => {
      const action = button.getAttribute("data-action");
      if (action === "next") showCard(currentIndex + 1);
      if (action === "prev") showCard(currentIndex - 1);
    });
  });

  carousel.addEventListener("mouseenter", stopAutoplay);
  carousel.addEventListener("mouseleave", startAutoplay);
  showCard(0);
  startAutoplay();
}

function crearTarjetaUsuario(usuario) {
  return `
    <article class="user-card">
      <img class="user-avatar" src="${usuario.fotoPerfil}" alt="Avatar de ${usuario.nombre}" loading="lazy">
      <h3 class="user-name">${usuario.nombre}</h3>
      <p class="user-email">${usuario.correo}</p>
      <span class="user-role">${usuario.rol}</span>
    </article>
  `;
}

async function cargarUsuarios() {
  const contenedor = document.getElementById("usuarios-grid");
  if (!contenedor) return;

  contenedor.innerHTML = '<p class="users-message">Cargando usuarios...</p>';

  try {
    const respuesta = await fetch("/api/usuarios");
    if (!respuesta.ok) {
      throw new Error(`Error HTTP ${respuesta.status}`);
    }

    const resultado = await respuesta.json();
    const usuarios = Array.isArray(resultado.data) ? resultado.data : [];

    contenedor.innerHTML = usuarios.map(crearTarjetaUsuario).join("");
  } catch (error) {
    contenedor.innerHTML =
      '<p class="users-message">No se pudieron cargar los usuarios. Verifica que el servidor esté en ejecución e inténtalo de nuevo.</p>';
  }
}

document.addEventListener("DOMContentLoaded", () => {
  initCarousel();
  cargarUsuarios();
});
