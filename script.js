document.addEventListener("DOMContentLoaded", () => {
  const yearEl = document.getElementById("current-year");
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }
});

// Funcionamiento del formulario de contacto con FormSubmit AJAX (sin redirecciones)
const form = document.getElementById("form-contacto");

if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const btnForm = document.getElementById("btn-form");
    const textoOriginal = btnForm.innerHTML;

    btnForm.innerHTML = "Enviando...";
    btnForm.disabled = true;

    try {
      const response = await fetch(
        "https://formsubmit.co/ajax/soporte@lexilegal.es",
        {
          method: "POST",
          headers: {
            Accept: "application/json",
          },
          body: new FormData(form),
        },
      );

      if (response.ok) {
        btnForm.innerHTML = "¡Enviado con éxito!";
        form.reset();
      } else {
        btnForm.innerHTML = "Error al enviar";
      }
    } catch (error) {
      console.error(error);
      btnForm.innerHTML = "Error de conexión";
    } finally {
      setTimeout(() => {
        btnForm.innerHTML = textoOriginal;
        btnForm.disabled = false;
      }, 3000);
    }
  });
}
