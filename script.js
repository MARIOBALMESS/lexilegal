document.addEventListener('DOMContentLoaded', () => {
  const yearEl = document.getElementById('current-year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }
});


// Funcionamiento del form de whatsapp

const formWhatsapp = document.getElementById('form-whatsapp')

if(formWhatsapp){
  formWhatsapp.addEventListener('submit', (e)=>{
    e.preventDefault();
    const nombre = document.getElementById('wa-nombre').value;
    const despacho = document.getElementById('wa-despacho').value;
    const mensaje = document.getElementById('wa-mensaje').value;

    const texto = `Hola soy ${nombre} del despacho ${despacho}. Consulta: ${mensaje}`
    const url = `https://wa.me/34665028110?text=${encodeURIComponent(texto)}`

    window.open(url, '_blank')
  })
}