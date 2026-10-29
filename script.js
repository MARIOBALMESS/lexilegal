// Timestamp de carga de página para mitigar bots automáticos
const pageLoadTime = Date.now();

document.addEventListener("DOMContentLoaded", () => {
  const yearEl = document.getElementById("current-year");
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }
});

// Sistema de Formulario Resiliente con Ciberseguridad Defensiva
const form = document.getElementById("form-contacto");
const statusEl = document.getElementById("form-status");

function setStatus(htmlContent, type) {
  if (!statusEl) return;
  statusEl.className = "form-status " + (type || "");
  statusEl.innerHTML = htmlContent;
  statusEl.style.display = "block";
}

function clearStatus() {
  if (!statusEl) return;
  statusEl.className = "form-status";
  statusEl.innerHTML = "";
  statusEl.style.display = "none";
}

if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    clearStatus();

    const btnForm = document.getElementById("btn-form");
    const textoOriginal = btnForm.innerHTML;

    // 1. FILTRO ANTI-BOT 1: Honeypot (campo trampa oculto)
    const honeyTrap = document.getElementById("honey-trap");
    if (honeyTrap && honeyTrap.value.trim().length > 0) {
      console.warn("Bot detectado mediante Honeypot.");
      // Respuesta simulada para engañar al bot sin procesar nada
      btnForm.innerHTML = "¡Enviado con éxito!";
      form.reset();
      setTimeout(() => {
        btnForm.innerHTML = textoOriginal;
      }, 3000);
      return;
    }

    // 2. FILTRO ANTI-BOT 2: Time-gate (los bots envían el formulario en milisegundos)
    if (Date.now() - pageLoadTime < 1200) {
      console.warn("Envío demasiado rápido; posible bot.");
      btnForm.innerHTML = "¡Enviado con éxito!";
      form.reset();
      setTimeout(() => {
        btnForm.innerHTML = textoOriginal;
      }, 3000);
      return;
    }

    // 3. PROTECCIÓN CONTRA INUNDACIÓN (Rate Limiting en LocalStorage: 1 envío cada 25s)
    const lastSubmit = localStorage.getItem("lexilegal_last_submit");
    if (lastSubmit && (Date.now() - Number(lastSubmit)) < 25000) {
      const segundosRestantes = Math.ceil((25000 - (Date.now() - Number(lastSubmit))) / 1000);
      setStatus(`Has enviado un mensaje recientemente. Por seguridad, espera ${segundosRestantes} segundos antes de enviar otro.`, "warning");
      return;
    }

    // 4. SANITIZACIÓN Y VALIDACIÓN DE DATOS
    const nombre = (document.getElementById("nombre-form")?.value || "").trim();
    const email = (document.getElementById("correo-form")?.value || "").trim();
    const asunto = (document.getElementById("asunto-form")?.value || "").trim();
    const mensaje = (document.getElementById("mensaje-form")?.value || "").trim();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (!emailRegex.test(email)) {
      setStatus("Por favor, introduce una dirección de correo electrónico válida.", "error");
      return;
    }

    if (!nombre || !asunto || !mensaje) {
      setStatus("Por favor, completa todos los campos del formulario.", "error");
      return;
    }

    // Preparar URLs de respaldo seguro (Mailto y WhatsApp)
    const emailDestino = "soporte@lexilegal.es";
    const mailtoSubject = encodeURIComponent(`[LexiLegal] ${asunto}`);
    const mailtoBody = encodeURIComponent(`Nombre: ${nombre}\nEmail: ${email}\n\nMensaje:\n${mensaje}`);
    const mailtoUrl = `mailto:${emailDestino}?subject=${mailtoSubject}&body=${mailtoBody}`;

    const waTexto = encodeURIComponent(`Hola, soy ${nombre} (${email}). Asunto: ${asunto}. Mensaje: ${mensaje}`);
    const waUrl = `https://wa.me/34665028110?text=${waTexto}`;

    btnForm.innerHTML = "Enviando...";
    btnForm.disabled = true;

    // 5. INTENTO DE ENVÍO CON TIMEOUT Y GESTIÓN DE CAÍDAS (Fail-Safe)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000); // 6s timeout

    try {
      const response = await fetch(
        "https://formsubmit.co/ajax/soporte@lexilegal.es",
        {
          method: "POST",
          headers: {
            Accept: "application/json",
          },
          body: new FormData(form),
          signal: controller.signal,
        },
      );

      clearTimeout(timeoutId);

      if (response.ok) {
        btnForm.innerHTML = "¡Enviado con éxito!";
        localStorage.setItem("lexilegal_last_submit", Date.now().toString());
        setStatus("¡Gracias! Tu mensaje ha sido enviado correctamente. Responderemos lo antes posible.", "success");
        form.reset();
        setTimeout(() => {
          btnForm.innerHTML = textoOriginal;
          btnForm.disabled = false;
        }, 4000);
      } else {
        throw new Error(`Respuesta HTTP no satisfactoria: ${response.status}`);
      }
    } catch (error) {
      clearTimeout(timeoutId);
      console.warn("Servicio externo no disponible o conexión rechazada:", error);

      // Respaldo inteligente: si el proveedor externo está caído (error 521, timeout o error de red),
      // no dejamos al usuario con error de conexión; habilitamos el canal directo al instante.
      btnForm.innerHTML = "Canal directo activado";
      btnForm.disabled = false;

      setStatus(`
        <strong>⚠️ Servidor de correo externo temporalmente no disponible.</strong>
        <p style="margin: 0.35rem 0 0.5rem 0; font-size: 0.8rem; color: #d4d4d8;">
          Hemos preparado tu mensaje para enviarlo directamente sin esperas:
        </p>
        <div class="form-fallback-actions">
          <a href="${mailtoUrl}" class="form-fallback-btn">✉️ Abrir en tu correo</a>
          <a href="${waUrl}" target="_blank" rel="noopener noreferrer" class="form-fallback-btn wa">💬 Enviar por WhatsApp</a>
        </div>
      `, "warning");

      // Abre el cliente de correo predeterminado del usuario con el mensaje ya redactado
      window.location.href = mailtoUrl;

      setTimeout(() => {
        btnForm.innerHTML = textoOriginal;
      }, 5000);
    }
  });
}
