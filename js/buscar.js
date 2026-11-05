// js/buscar.js - Lógica del catálogo con Supabase y enlace a mapa
let CASAS = [];
let listaMostrada = [];
let fotosActuales = [];
let indiceFoto = 0;

function formatoPrecio(numero) {
  return "Bs " + Number(numero).toLocaleString("es-BO");
}

function mostrarCasas(lista) {
  const contenedor = document.getElementById("listaCasas");
  const sinResultados = document.getElementById("sinResultados");
  const contador = document.getElementById("contador");

  contenedor.innerHTML = "";
  listaMostrada = lista || [];

  if (!lista || lista.length === 0) {
    sinResultados.classList.remove("hidden");
    contador.textContent = "0 casas encontradas";
    return;
  }

  sinResultados.classList.add("hidden");
  contador.textContent = lista.length + (lista.length === 1 ? " casa encontrada" : " casas encontradas");

  for (let i = 0; i < lista.length; i++) {
    const casa = lista[i];
    let fotoPrincipal = "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=600";
    if (casa.imagenes && casa.imagenes.length > 0) {
      fotoPrincipal = casa.imagenes[0];
    }
    const cantidadFotos = (casa.imagenes && casa.imagenes.length) ? casa.imagenes.length : 0;
    const textoFotos = cantidadFotos > 1
      ? '<i class="fa-solid fa-images"></i> Ver ' + cantidadFotos + ' fotos'
      : '<i class="fa-solid fa-image"></i> Ver foto';

    const tarjeta = document.createElement("div");
    tarjeta.className = "bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm tarjeta flex flex-col justify-between";

    const tituloSanitizado = (casa.titulo || "").replace(/'/g, "");
    const direccionSanitizada = (casa.direccion || "").replace(/'/g, "");

    // Botón de mapa si la casa cuenta con coordenadas registradas
    const botonMapa = (casa.latitud && casa.longitud)
      ? '<a href="https://www.google.com/maps?q=' + casa.latitud + ',' + casa.longitud + '" target="_blank" ' +
        'class="w-full text-center bg-emerald-50 hover:bg-emerald-100 text-emerald-800 py-2 rounded-xl font-medium text-xs flex items-center justify-center gap-1.5 border border-emerald-200 transition">' +
        '<i class="fa-solid fa-map-location-dot text-emerald-600"></i> Ver ubicación en mapa' +
        '</a>'
      : '';

    tarjeta.innerHTML =
      '<div class="relative">' +
        '<img src="' + fotoPrincipal + '" alt="' + (casa.titulo || "") + '" class="w-full h-48 object-cover" ' +
          'onerror="this.src=\'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=600\'">' +
        '<span class="absolute top-3 left-3 bg-emerald-600 text-white text-xs px-3 py-1 rounded-full capitalize">' +
          (casa.tipo || "casa") +
        '</span>' +
        '<button onclick="abrirGaleria(' + i + ')" ' +
          'class="absolute bottom-3 right-3 bg-black bg-opacity-70 hover:bg-opacity-80 text-white text-xs px-3 py-1.5 rounded-full transition">' +
          textoFotos +
        '</button>' +
      '</div>' +
      '<div class="p-4 flex flex-col flex-1 justify-between">' +
        '<div>' +
          '<div class="flex justify-between items-start mb-1">' +
            '<span class="font-bold text-xl text-emerald-700">' + formatoPrecio(casa.precio) + '</span>' +
            '<span class="text-xs text-gray-500">/mes</span>' +
          '</div>' +
          '<h3 class="font-semibold text-gray-900 mb-1">' + (casa.titulo || "") + '</h3>' +
          '<p class="text-sm text-gray-500 mb-2">' +
            '<i class="fa-solid fa-location-dot text-emerald-500"></i> ' + (casa.direccion || "") +
          '</p>' +
          '<div class="flex gap-3 text-sm text-gray-600 mb-3">' +
            '<span><i class="fa-solid fa-bed"></i> ' + (casa.habitaciones || 0) + ' hab</span>' +
            '<span><i class="fa-solid fa-bath"></i> ' + (casa.banos || 0) + ' baños</span>' +
            (casa.tamanio ? '<span><i class="fa-solid fa-ruler-combined"></i> ' + casa.tamanio + ' m²</span>' : '') +
          '</div>' +
          '<p class="text-sm text-gray-600 mb-4" style="display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;">' +
            (casa.descripcion || "") +
          '</p>' +
        '</div>' +
        '<div class="space-y-2 mt-auto">' +
          botonMapa +
          '<button onclick="contactarDueno(\'' + (casa.whatsapp || "") + '\', \'' + tituloSanitizado + '\')" ' +
            'class="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-xl font-semibold text-sm transition">' +
            '<i class="fa-brands fa-whatsapp"></i> Contactar dueño' +
          '</button>' +
          '<button onclick="avisarIntermediario(\'' + tituloSanitizado + '\', \'' + direccionSanitizada + '\', ' + (casa.precio || 0) + ')" ' +
            'class="w-full bg-blue-50 hover:bg-blue-100 text-blue-700 py-2.5 rounded-xl font-semibold text-sm border border-blue-200 transition">' +
            '<i class="fa-solid fa-bell"></i> Ya se va a alquilar (avisar)' +
          '</button>' +
        '</div>' +
      '</div>';

    contenedor.appendChild(tarjeta);
  }
}

// Galería modal de fotos
function abrirGaleria(indice) {
  const casa = listaMostrada[indice];
  if (!casa || !casa.imagenes || casa.imagenes.length === 0) {
    alert("No hay fotos disponibles");
    return;
  }

  fotosActuales = casa.imagenes;
  indiceFoto = 0;

  document.getElementById("modalTitulo").textContent = casa.titulo || "Fotos de la casa";
  document.getElementById("fotoGrande").src = fotosActuales[0];
  document.getElementById("contadorFoto").textContent = "1 / " + fotosActuales.length;

  const galeria = document.getElementById("modalGaleria");
  galeria.innerHTML = "";
  for (let i = 0; i < fotosActuales.length; i++) {
    const img = document.createElement("img");
    img.src = fotosActuales[i];
    img.className = "w-full h-20 object-cover rounded-lg cursor-pointer border-2 border-transparent hover:border-emerald-500 transition";
    img.onclick = (function (num) {
      return function () {
        indiceFoto = num;
        document.getElementById("fotoGrande").src = fotosActuales[num];
        document.getElementById("contadorFoto").textContent = (num + 1) + " / " + fotosActuales.length;
      };
    })(i);
    galeria.appendChild(img);
  }

  document.getElementById("modalFotos").classList.add("activo");
}

function cerrarModal() {
  document.getElementById("modalFotos").classList.remove("activo");
}

function fotoAnterior() {
  if (fotosActuales.length === 0) return;
  indiceFoto = (indiceFoto - 1 + fotosActuales.length) % fotosActuales.length;
  document.getElementById("fotoGrande").src = fotosActuales[indiceFoto];
  document.getElementById("contadorFoto").textContent = (indiceFoto + 1) + " / " + fotosActuales.length;
}

function fotoSiguiente() {
  if (fotosActuales.length === 0) return;
  indiceFoto = (indiceFoto + 1) % fotosActuales.length;
  document.getElementById("fotoGrande").src = fotosActuales[indiceFoto];
  document.getElementById("contadorFoto").textContent = (indiceFoto + 1) + " / " + fotosActuales.length;
}

// Contacto por WhatsApp
function contactarDueno(telefono, titulo) {
  const limpio = String(telefono).replace(/\D/g, "");
  const mensaje = "Hola, vi tu anuncio en Puertas Abiertas y me interesa: \"" + titulo + "\". ¿Sigue disponible?";
  window.open("https://wa.me/" + limpio + "?text=" + encodeURIComponent(mensaje), "_blank");
}

function avisarIntermediario(titulo, direccion, precio) {
  const mensaje =
    "Hola, te escribo desde Puertas Abiertas.\n\n" +
    "La siguiente casa se va a alquilar (o ya se alquiló):\n" +
    "• Título: " + titulo + "\n" +
    "• Dirección: " + direccion + "\n" +
    "• Precio: Bs " + precio + "\n\n" +
    "Por favor quítala del sitio web. Gracias.";
  const numIntermediario = typeof WHATSAPP_INTERMEDIARIO !== "undefined" ? WHATSAPP_INTERMEDIARIO : "";
  window.open("https://wa.me/" + numIntermediario + "?text=" + encodeURIComponent(mensaje), "_blank");
}

// Filtrado dinámico
function filtrar() {
  const texto = document.getElementById("buscarTexto").value.toLowerCase().trim();
  const maxPrecio = document.getElementById("filtroPrecio").value;
  const minHab = parseInt(document.getElementById("filtroHab").value) || 0;

  const filtradas = [];
  for (let i = 0; i < CASAS.length; i++) {
    const c = CASAS[i];
    if (c.activo === false) continue;

    const coincideTexto = !texto ||
      (c.titulo || "").toLowerCase().indexOf(texto) !== -1 ||
      (c.direccion || "").toLowerCase().indexOf(texto) !== -1 ||
      (c.descripcion || "").toLowerCase().indexOf(texto) !== -1;

    const coincidePrecio = maxPrecio === "all" || !maxPrecio || Number(c.precio) <= Number(maxPrecio);
    const coincideHab = Number(c.habitaciones) >= minHab;

    if (coincideTexto && coincidePrecio && coincideHab) {
      filtradas.push(c);
    }
  }
  mostrarCasas(filtradas);
}

// Carga en tiempo real desde Supabase
async function cargarCasasDesdeSupabase() {
  const contador = document.getElementById("contador");
  contador.textContent = "Cargando propiedades en tiempo real...";

  if (!supabase) {
    contador.textContent = "Error: Cliente de Supabase no configurado.";
    return;
  }

  const { data, error } = await supabase
    .from('casas')
    .select('*')
    .eq('activo', true)
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Error al obtener casas:", error);
    contador.textContent = "Error al cargar las propiedades.";
    return;
  }

  CASAS = data || [];
  filtrar();
}

// Inicialización de eventos
document.addEventListener("DOMContentLoaded", function () {
  document.getElementById("buscarTexto").addEventListener("input", filtrar);
  document.getElementById("filtroPrecio").addEventListener("change", filtrar);
  document.getElementById("filtroHab").addEventListener("change", filtrar);

  const modal = document.getElementById("modalFotos");
  if (modal) {
    modal.addEventListener("click", function (e) {
      if (e.target === this) cerrarModal();
    });
  }

  cargarCasasDesdeSupabase();
});