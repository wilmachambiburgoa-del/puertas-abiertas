// js/mis-publicaciones.js - Gestión de casas propias del usuario
document.addEventListener("DOMContentLoaded", async function () {
  const cargando = document.getElementById("cargandoMisCasas");
  const vacio = document.getElementById("sinPublicaciones");
  const contenedor = document.getElementById("listaMisCasas");

  if (!supabase) return;

  // Verificar si hay sesión activa
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    alert("Debes iniciar sesión para ver tus publicaciones.");
    window.location.href = "login.html";
    return;
  }

  const userId = session.user.id;

  async function cargarMisCasas() {
    cargando.classList.remove("hidden");
    vacio.classList.add("hidden");
    contenedor.innerHTML = "";

    const { data: casas, error } = await supabase
      .from('casas')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    cargando.classList.add("hidden");

    if (error) {
      console.error(error);
      alert("Error al cargar tus publicaciones: " + error.message);
      return;
    }

    if (!casas || casas.length === 0) {
      vacio.classList.remove("hidden");
      return;
    }

    casas.forEach(casa => {
      const tarjeta = document.createElement("div");
      tarjeta.className = "bg-white rounded-2xl overflow-hidden border border-gray-200/80 shadow-sm flex flex-col justify-between transition hover:shadow-md";

      const foto = (casa.imagenes && casa.imagenes.length > 0)
        ? casa.imagenes[0]
        : "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=600";

      const estadoBadge = casa.activo
        ? '<span class="bg-emerald-600 text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-sm"><i class="fa-solid fa-circle-check mr-1"></i> Disponible</span>'
        : '<span class="bg-amber-600 text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-sm"><i class="fa-solid fa-lock mr-1"></i> Ya Alquilado</span>';

      tarjeta.innerHTML = `
        <div class="relative">
          <img src="${foto}" class="w-full h-44 object-cover" onerror="this.src='https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=600'">
          <div class="absolute top-3 left-3 flex gap-2">
            ${estadoBadge}
          </div>
          <span class="absolute top-3 right-3 bg-black/60 text-white text-[11px] px-2.5 py-0.5 rounded-md capitalize font-medium">
            ${casa.tipo || 'casa'}
          </span>
        </div>

        <div class="p-4 flex flex-col flex-1 justify-between">
          <div>
            <div class="flex justify-between items-baseline mb-1">
              <span class="text-xl font-bold text-emerald-800">Bs ${Number(casa.precio).toLocaleString("es-BO")}</span>
              <span class="text-xs text-gray-500">/mes</span>
            </div>
            <h3 class="font-bold text-gray-900 text-base mb-1 line-clamp-1">${casa.titulo}</h3>
            <p class="text-xs text-gray-500 mb-3 flex items-center gap-1 line-clamp-1">
              <i class="fa-solid fa-location-dot text-emerald-600"></i> ${casa.direccion}
            </p>
          </div>

          <div class="border-t border-gray-100 pt-3 mt-3 flex flex-col gap-2">
            <!-- Botón Cambiar Estado -->
            <button onclick="alternarEstado(${casa.id}, ${casa.activo})"
                    class="w-full py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
                      casa.activo 
                        ? 'bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200' 
                        : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200'
                    }">
              <i class="fa-solid ${casa.activo ? 'fa-lock' : 'fa-lock-open'}"></i>
              ${casa.activo ? 'Marcar como Alquilado (Ocultar)' : 'Marcar como Disponible (Mostrar)'}
            </button>

            <!-- Botón Eliminar -->
            <button onclick="eliminarPublicacion(${casa.id})"
                    class="w-full py-2 px-3 rounded-xl text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-rose-200 flex items-center justify-center gap-1.5 transition">
              <i class="fa-solid fa-trash-can"></i> Eliminar anuncio
            </button>
          </div>
        </div>
      `;
      contenedor.appendChild(tarjeta);
    });
  }

  // Función para cambiar disponibilidad
  window.alternarEstado = async function (id, estadoActual) {
    const nuevoEstado = !estadoActual;
    const mensaje = nuevoEstado 
      ? "¿Deseas volver a mostrar este anuncio como Disponible en el catálogo?" 
      : "¿Deseas marcar este anuncio como Alquilado? Se ocultará del catálogo general.";

    if (!confirm(mensaje)) return;

    const { error } = await supabase
      .from('casas')
      .update({ activo: nuevoEstado })
      .eq('id', id);

    if (error) {
      alert("Error al actualizar estado: " + error.message);
      return;
    }

    cargarMisCasas();
  };

  // Función para eliminar
  window.eliminarPublicacion = async function (id) {
    if (!confirm("¿Estás seguro de eliminar este anuncio definitivamente? Esta acción no se puede deshacer.")) return;

    const { error } = await supabase
      .from('casas')
      .delete()
      .eq('id', id);

    if (error) {
      alert("Error al eliminar el anuncio: " + error.message);
      return;
    }

    cargarMisCasas();
  };

  cargarMisCasas();
});