// js/upload.js - Lógica de publicación y renderizado del mapa sin API Key
document.addEventListener("DOMContentLoaded", async function () {
  const inputFotos = document.getElementById("inputFotos");
  const vistaPrevia = document.getElementById("vistaPrevia");
  const formCasa = document.getElementById("formCasa");
  const btnEnviar = document.getElementById("btnEnviar");
  const btnMiUbicacion = document.getElementById("btnMiUbicacion");
  const inputLat = document.getElementById("latitud");
  const inputLng = document.getElementById("longitud");
  const coordenadasTexto = document.getElementById("coordenadasTexto");
  const inputNombre = document.getElementById("inputNombre");

  if (!supabase) return;

  // 1. Validar que el usuario haya iniciado sesión
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    alert("Debes iniciar sesión para publicar una propiedad.");
    window.location.href = "login.html";
    return;
  }

  if (session.user.user_metadata?.full_name && inputNombre) {
    inputNombre.value = session.user.user_metadata.full_name;
  }

  // 2. Coordenadas predeterminadas (Satélite Norte, Warnes, Santa Cruz)
  const latDefault = -17.5855;
  const lngDefault = -63.1612;
  inputLat.value = latDefault;
  inputLng.value = lngDefault;

  // 3. Solución para iconos oficiales de Leaflet en CDN
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  });

  // 4. Inicialización del mapa con Esri WorldStreetMap (100% gratuito y sin API Key)
  const map = L.map("mapaSelector").setView([latDefault, lngDefault], 14);

  L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}", {
    maxZoom: 19,
    attribution: 'Tiles &copy; Esri &mdash; OpenStreetMap contributors'
  }).addTo(map);

  const marker = L.marker([latDefault, lngDefault], { draggable: true }).addTo(map);

  function actualizarCoordenadas(lat, lng) {
    inputLat.value = Number(lat).toFixed(6);
    inputLng.value = Number(lng).toFixed(6);
    coordenadasTexto.textContent = `📍 Coordenadas: ${Number(lat).toFixed(5)}, ${Number(lng).toFixed(5)}`;
  }

  marker.on("dragend", function () {
    const pos = marker.getLatLng();
    actualizarCoordenadas(pos.lat, pos.lng);
  });

  map.on("click", function (e) {
    marker.setLatLng(e.latlng);
    actualizarCoordenadas(e.latlng.lat, e.latlng.lng);
  });

  // Asegurar que el mapa calcule su tamaño al mostrarse
  setTimeout(() => {
    map.invalidateSize();
  }, 400);

  // 5. Botón GPS de ubicación actual
  btnMiUbicacion.addEventListener("click", function () {
    if (!navigator.geolocation) {
      alert("Tu dispositivo no soporta geolocalización.");
      return;
    }
    btnMiUbicacion.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Obteniendo...';
    btnMiUbicacion.disabled = true;

    navigator.geolocation.getCurrentPosition(
      function (pos) {
        const miLat = pos.coords.latitude;
        const miLng = pos.coords.longitude;
        map.setView([miLat, miLng], 16);
        marker.setLatLng([miLat, miLng]);
        actualizarCoordenadas(miLat, miLng);
        map.invalidateSize();

        btnMiUbicacion.innerHTML = '<i class="fa-solid fa-check text-emerald-600"></i> Ubicación obtenida';
        setTimeout(() => {
          btnMiUbicacion.innerHTML = '<i class="fa-solid fa-crosshairs text-emerald-600"></i> Usar mi ubicación actual (GPS)';
          btnMiUbicacion.disabled = false;
        }, 2000);
      },
      function () {
        btnMiUbicacion.innerHTML = '<i class="fa-solid fa-crosshairs text-emerald-600"></i> Usar mi ubicación actual (GPS)';
        btnMiUbicacion.disabled = false;
        alert("No se pudo obtener la señal GPS del dispositivo.");
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  });

  // 6. Previsualización de imágenes seleccionadas
  inputFotos.addEventListener("change", function () {
    const archivos = this.files;
    if (archivos.length > 4) {
      alert("Solo puedes subir un máximo de 4 fotografías");
      this.value = "";
      vistaPrevia.innerHTML = "";
      return;
    }

    vistaPrevia.innerHTML = "";
    for (let i = 0; i < archivos.length; i++) {
      const lector = new FileReader();
      lector.onload = function (e) {
        const div = document.createElement("div");
        div.innerHTML = `<img src="${e.target.result}" class="w-full h-24 object-cover rounded-xl border border-emerald-200">`;
        vistaPrevia.appendChild(div);
      };
      lector.readAsDataURL(archivos[i]);
    }
  });

  // 7. Envío del formulario y subida a Supabase
  formCasa.addEventListener("submit", async function (e) {
    e.preventDefault();

    const archivos = inputFotos.files;
    if (!archivos || archivos.length < 1) {
      alert("Debes seleccionar al menos una foto de la vivienda.");
      return;
    }

    btnEnviar.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Subiendo y publicando...';
    btnEnviar.disabled = true;

    try {
      const imagenesUrls = [];

      for (let i = 0; i < archivos.length; i++) {
        const file = archivos[i];
        const ext = file.name.split('.').pop();
        const nombreArchivo = `${session.user.id}_${Date.now()}_${i}.${ext}`;

        const { error: uploadError } = await supabase.storage
          .from('fotos-casas')
          .upload(nombreArchivo, file, { cacheControl: '3600', upsert: false });

        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage
          .from('fotos-casas')
          .getPublicUrl(nombreArchivo);

        imagenesUrls.push(publicUrlData.publicUrl);
      }

      const formData = new FormData(formCasa);
      const casaData = {
        user_id: session.user.id,
        nombre_dueno: formData.get("nombre"),
        whatsapp: formData.get("whatsapp"),
        titulo: formData.get("titulo"),
        direccion: formData.get("direccion"),
        precio: parseFloat(formData.get("precio")),
        habitaciones: parseInt(formData.get("habitaciones")),
        banos: parseInt(formData.get("banos")),
        tipo: formData.get("tipo"),
        descripcion: formData.get("descripcion"),
        imagenes: imagenesUrls,
        latitud: parseFloat(inputLat.value),
        longitud: parseFloat(inputLng.value),
        activo: true
      };

      const { error: insertError } = await supabase.from('casas').insert([casaData]);
      if (insertError) throw insertError;

      window.location.href = "mis-publicaciones.html";

    } catch (err) {
      console.error(err);
      alert("Error al publicar: " + err.message);
      btnEnviar.innerHTML = '<i class="fa-solid fa-paper-plane"></i> Publicar anuncio ahora';
      btnEnviar.disabled = false;
    }
  });
});