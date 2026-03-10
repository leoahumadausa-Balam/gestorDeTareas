// clases.js (Capa de Lógica de Negocio y Estructura POO)

class Tarea {
    constructor(titulo, descripcion, prioridad, fechaLimite = null) {
        this.id = Date.now();
        this.titulo = titulo;
        this.descripcion = descripcion;
        this.prioridad = prioridad;
        this.fechaLimite = fechaLimite;
        this.estado = 'Pendiente'; // Estado por defecto
        this.fechaCreacion = new Date().toISOString();
    }

    actualizarEstado(nuevoEstado) {
        this.estado = nuevoEstado;
    }

    editarDatos(nuevosDatos) {
        if (nuevosDatos.titulo) this.titulo = nuevosDatos.titulo;
        if (nuevosDatos.descripcion) this.descripcion = nuevosDatos.descripcion;
        if (nuevosDatos.prioridad) this.prioridad = nuevosDatos.prioridad;
    }
}

class GestorTareas {
    constructor() {
        this.tareas = [];
        // La carga desde Storage se hace mediante app.js explícitamente porque es Asíncrona
    }

    async agregarTarea(datos) {
        const { titulo, descripcion, prioridad, fechaLimite } = datos;
        const nuevaTarea = new Tarea(titulo, descripcion, prioridad, fechaLimite);

        try {
            // Intento de persistencia remota empleando la capa de Servicios (api.js)
            await APIServicios.guardarTareaSimulada(titulo);
        } catch (error) {
            // Delega una alerta visual de "Offline" si la capa del DOM (app.js) está cargada
            if (typeof mostrarAlertaDinamica === 'function') {
                mostrarAlertaDinamica("Advertencia: Offline. Guardado localmente.", "warning");
            }
        }

        this.tareas.push(nuevaTarea);
        this.guardarEnStorage();
        return nuevaTarea;
    }

    eliminarTarea(id) {
        this.tareas = this.tareas.filter(tarea => tarea.id !== id);
        this.guardarEnStorage();
    }

    guardarEnStorage() {
        localStorage.setItem('tareas', JSON.stringify(this.tareas));
    }

    async cargarDesdeStorage() {
        const datosAsociados = localStorage.getItem('tareas');
        if (datosAsociados && JSON.parse(datosAsociados).length > 0) {
            const tareasParseadas = JSON.parse(datosAsociados);
            // Reconstruir los Objetos a partir de Objetos Anónimos
            this.tareas = tareasParseadas.map(t => {
                const { titulo, descripcion, prioridad, fechaLimite, ...resto } = t;
                const tarea = new Tarea(titulo, descripcion, prioridad, fechaLimite);
                Object.assign(tarea, resto);
                return tarea;
            });
        } else {
            // Petición Inicial (Estrategia Fallback)
            await this.obtenerDatosDeAPI();
        }
    }

    async obtenerDatosDeAPI() {
        try {
            // Usa el controlador de red global extraído en api.js
            const tareasFake = await APIServicios.obtenerTareasSimuladas();

            const titulosEnEspanol = [
                "Terminar proyecto final",
                "Comprar insumos para el hogar",
                "Revisar código del equipo",
                "Hacer rutina de ejercicios"
            ];

            this.tareas = tareasFake.map((apiTask, index) => {
                const rndPrioridad = ['Baja', 'Media', 'Alta'][Math.floor(Math.random() * 3)];
                const tituloTraducido = titulosEnEspanol[index] || "Tarea importada de la nube";

                const objTarea = new Tarea(tituloTraducido, "Tarea descargada mediante fetch() desde API externa.", rndPrioridad);
                // Previene bugs de colisión del Date.now() al renderizar el bucle síncrono
                objTarea.id = Date.now() + index;
                objTarea.actualizarEstado(apiTask.completed ? 'Realizada' : 'Pendiente');
                return objTarea;
            });

            this.guardarEnStorage();

            // Sincronización Inversa con el UI
            if (typeof mostrarAlertaDinamica === 'function') {
                mostrarAlertaDinamica("Datos de prueba traídos mediante Fetch API", "info");
                // Forzar re-render de las nuevas inyecciones
                if (typeof renderizarTareas === 'function') renderizarTareas();
            }
        } catch (error) {
            if (typeof mostrarAlertaDinamica === 'function') {
                mostrarAlertaDinamica("Error al conectar con la API falsa.", "danger");
            }
        }
    }
}
