// Lógica para index.html
document.addEventListener("DOMContentLoaded", function () {
  const btnWhatsAppContacto = document.getElementById("btnWhatsAppContacto");
  if (btnWhatsAppContacto && typeof WHATSAPP_INTERMEDIARIO !== "undefined") {
    btnWhatsAppContacto.href =
      "https://wa.me/" + WHATSAPP_INTERMEDIARIO + "?text=" +
      encodeURIComponent("Hola, tengo una consulta sobre Puertas Abiertas.");
  }
});
