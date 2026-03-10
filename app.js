// app.js (Capa de Vista - Manipulación del DOM y Eventos Interactivos)

// 1. Inicialización del Gestor Global (Clase definida en clases.js)
const gestor = new GestorTareas();

// 2. Referencias del DOM
const formularioTarea = document.getElementById('formulario-tarea');
const modalNuevaTarea = document.getElementById('modalNuevaTarea');
const modalBsInstancia = new bootstrap.Modal(modalNuevaTarea); // Interfaz programática del modal

const columnaPendiente = document.getElementById('columna-pendiente');
const columnaProgreso = document.getElementById('columna-progreso');
const columnaRealizada = document.getElementById('columna-realizada');

const inputBuscador = document.getElementById('inputBuscador'); // Buscador en header

// 3. Inicio del Ciclo de Vida: Carga inicial de datos
document.addEventListener('DOMContentLoaded', async () => {
    await gestor.cargarDesdeStorage(); // Mapea API o carga de disco duro
    renderizarTareas(); // Renderiza tras acabar de resolver todas las promesas
});

// 4. Eventos
formularioTarea.addEventListener('submit', async (e) => {
    e.preventDefault();

    const titulo = document.getElementById('inputTitulo').value;
    const descripcion = document.getElementById('inputDescripcion').value;
    const prioridad = document.getElementById('selectPrioridad').value;
    const fechaLimite = document.getElementById('inputFechaLimite').value;

    const btnSubmit = formularioTarea.querySelector('button[type="submit"]');
    const textoOriginal = btnSubmit.innerHTML;
    btnSubmit.innerHTML = `<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Guardando...`;
    btnSubmit.disabled = true;

    // UX Addon
    await simularPeticionRed(2000);

    await gestor.agregarTarea({ titulo, descripcion, prioridad, fechaLimite });

    formularioTarea.reset();
    btnSubmit.innerHTML = textoOriginal;
    btnSubmit.disabled = false;
    modalBsInstancia.hide();

    renderizarTareas();
});

inputBuscador.addEventListener('keyup', () => {
    renderizarTareas();
});

// 5. Funciones Generales de Interfaz (Pintar UI)
const renderizarTareas = () => {
    columnaPendiente.innerHTML = '';
    columnaProgreso.innerHTML = '';
    columnaRealizada.innerHTML = '';

    const storageData = localStorage.getItem('tareas');
    if (!storageData) return;

    const tareasPersistidas = JSON.parse(storageData);

    // Filtrado en tiempo real (Keyup event listener injecta dependencias aquí)
    const terminoBusqueda = inputBuscador.value.toLowerCase().trim();
    const tareasFiltradas = tareasPersistidas.filter(t => t.titulo.toLowerCase().includes(terminoBusqueda) || t.descripcion.toLowerCase().includes(terminoBusqueda));

    tareasFiltradas.forEach(tarea => {
        let btnEstadoHTML = '';
        if (tarea.estado === 'Pendiente') {
            btnEstadoHTML = `<button class="btn btn-sm btn-outline-info btn-accion" onclick="cambiarEstadoTarea(this, ${tarea.id}, 'En Progreso')" title="Mover a En Progreso">▶️ Empezar</button>`;
        } else if (tarea.estado === 'En Progreso') {
            btnEstadoHTML = `<button class="btn btn-sm btn-outline-success btn-accion" onclick="cambiarEstadoTarea(this, ${tarea.id}, 'Realizada')" title="Mover a Realizada">✅ Finalizar</button>`;
        }

        const tarjetaHTML = `
            <div class="flip-container border-start border-4 ${obtenerColorPrioridad(tarea.prioridad)}" id="tarea-${tarea.id}" onmouseover="voltearTarjeta(this, true)" onmouseout="voltearTarjeta(this, false)">
                <div class="flipper">
                    <!-- Frente: Sólo Título -->
                    <div class="front">
                        <h6 class="card-title text-truncate fw-bold mb-0 text-dark" title="${tarea.titulo}">${tarea.titulo}</h6>
                    </div>
                    <!-- Reverso: Detalles y Botones -->
                    <div class="back">
                        <p class="card-text small text-muted mb-1 text-truncate" style="flex-grow: 1;" title="${tarea.descripcion}">${tarea.descripcion}</p>
                        <div id="tiempo-${tarea.id}" class="small mb-1 text-center" style="font-size: 0.8rem;"></div>
                        <div class="d-flex justify-content-between align-items-center mt-1 pt-1 border-top">
                            <span class="badge ${obtenerBadgePrioridad(tarea.prioridad)}" style="font-size: 0.70em;">${tarea.prioridad}</span>
                            <div class="btn-group">
                                ${btnEstadoHTML}
                                <button class="btn btn-sm btn-outline-danger px-2 py-0" onclick="eliminarTareaDOM(${tarea.id})" title="Eliminar Tarea"><small>🗑️</small></button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        if (tarea.estado === 'Pendiente') columnaPendiente.innerHTML += tarjetaHTML;
        else if (tarea.estado === 'En Progreso') columnaProgreso.innerHTML += tarjetaHTML;
        else if (tarea.estado === 'Realizada') columnaRealizada.innerHTML += tarjetaHTML;
    });
};

const voltearTarjeta = (elementoContenedor, esHover) => {
    if (esHover) elementoContenedor.classList.add('is-flipped');
    else elementoContenedor.classList.remove('is-flipped');
};

const cambiarEstadoTarea = async (botonContexto, id, nuevoEstado) => {
    const textoOriginal = botonContexto.innerHTML;
    botonContexto.innerHTML = `<span class="spinner-border spinner-border-sm" role="status"></span>`;
    botonContexto.disabled = true;

    await simularPeticionRed(1500);

    const tarea = gestor.tareas.find(t => t.id === id);
    if (tarea) {
        tarea.actualizarEstado(nuevoEstado);
        gestor.guardarEnStorage();

        renderizarTareas();

        let mensajeExito = "";
        if (nuevoEstado === 'En Progreso') mensajeExito = `¡Excelente! La tarea "${tarea.titulo}" ha comenzado.`;
        if (nuevoEstado === 'Realizada') mensajeExito = `¡Felicidades! Finalizaste "${tarea.titulo}".`;

        mostrarAlertaDinamica(mensajeExito, 'success');
    }
};

const eliminarTareaDOM = (id) => {
    if (confirm('¿Estás seguro de eliminar esta tarea?')) {
        gestor.eliminarTarea(id);
        renderizarTareas();
        mostrarAlertaDinamica('Tarea eliminada de la base de datos.', 'danger');
    }
};

const mostrarAlertaDinamica = (mensaje, tipoBootstrap) => {
    const alerta = document.createElement('div');
    alerta.className = `alert alert-${tipoBootstrap} alert-dismissible fade show position-fixed bottom-0 end-0 m-3 shadow z-3`;
    alerta.style.minWidth = '250px';
    alerta.innerHTML = `
        <strong>Aviso:</strong> ${mensaje}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    document.body.appendChild(alerta);
    setTimeout(() => {
        alerta.classList.remove('show');
        setTimeout(() => alerta.remove(), 150);
    }, 4000);
};

const obtenerColorPrioridad = (prioridad) => {
    switch (prioridad) {
        case 'Alta': return 'border-danger';
        case 'Media': return 'border-warning';
        case 'Baja': return 'border-success';
        default: return 'border-primary';
    }
};

const obtenerBadgePrioridad = (prioridad) => {
    switch (prioridad) {
        case 'Alta': return 'bg-danger';
        case 'Media': return 'bg-warning text-dark';
        case 'Baja': return 'bg-success';
        default: return 'bg-secondary';
    }
};

// 6. Loop de Tiempos Asíncronos
setInterval(() => {
    gestor.tareas.forEach(tarea => {
        const spanTiempo = document.getElementById(`tiempo-${tarea.id}`);
        if (!spanTiempo) return;

        if (tarea.estado === 'Realizada') {
            spanTiempo.innerHTML = "✅ Tarea Finalizada";
            spanTiempo.className = "small text-success fw-bold text-center mb-1";
            return;
        }

        if (!tarea.fechaLimite) {
            spanTiempo.innerHTML = "⏲️ Sin fecha límite";
            spanTiempo.className = "small text-muted text-center mb-1";
            return;
        }

        const ahora = new Date().getTime();
        const limite = new Date(tarea.fechaLimite).getTime();
        const diferencia = limite - ahora;

        if (diferencia < 0) {
            spanTiempo.innerHTML = "⚠️ ¡Plazo Vencido!";
            spanTiempo.className = "small text-danger fw-bold text-center mb-1";
            return;
        }

        const dias = Math.floor(diferencia / (1000 * 60 * 60 * 24));
        const horas = Math.floor((diferencia % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutos = Math.floor((diferencia % (1000 * 60 * 60)) / (1000 * 60));
        const segundos = Math.floor((diferencia % (1000 * 60)) / 1000);

        spanTiempo.innerHTML = `⏱️ ${dias}d ${horas}h ${minutos}m <span class="text-danger">${segundos}s</span>`;
        if (dias > 0) spanTiempo.className = "small text-primary fw-bold text-center mb-1";
        else spanTiempo.className = "small text-warning text-dark fw-bold text-center mb-1";
    });
}, 1000);
