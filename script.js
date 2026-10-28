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
    const btnForm=document.getElementById("btn-form")

    btnForm.innerHTML("enviado")
  })
}