# TaskMaster: Gestión de Tareas Avanzada 🚀

Este proyecto es una aplicación web interactiva desarrollada para cumplir con la **Evaluación del Módulo 4 de Alkemy (Programación Avanzada en JavaScript)**. 

La herramienta permite a los usuarios gestionar sus tareas diarias en un tablero dinámico tipo Kanban. Destaca por su enfoque moderno, empleando programación orientada a objetos (POO), características de ECMAScript 6+, asincronía y código modular.

## 📺 Demostración de la Aplicación

*(Puedes ver un video con la demostración de la aplicación en funcionamiento directamente en GitHub usando el enlace a continuación)*

📹 **[Ver Video de Demostración](https://github.com/leoahumadausa-Balam/gestorDeTareas/issues/1#issue-4053446392)**

---

## 📑 Informe de Proyecto y Desglose del Código

Para asegurar una arquitectura limpia, mantenible y escalable, el código fuente de JavaScript de este proyecto fue subdividido en tres archivos principales, cada uno con una responsabilidad única clara (inspirado en el patrón Modelo-Vista-Controlador / Capas lógicas). 

A continuación, se explica la utilidad fundamental de cada script y cómo aplican las exigencias del proyecto:

### 1. `clases.js` (Lógica de Negocio y Estructura de Datos)
Aquí reside el núcleo analítico de la aplicación, implementando todos los paradigmas de **Programación Orientada a Objetos (POO)** requeridos.
- **Clase `Tarea`:** Almacena el modelo unitario de datos para un ítem de la lista. 
- **Clase `GestorTareas`:** Controlador y gestor de estado. Administra la única fuente de la verdad para el ciclo de vida de la app.

**✏️ Ejemplo de POO implementado:**
```javascript
class Tarea {
    constructor(titulo, descripcion, prioridad, fechaLimite = null) {
        this.id = Date.now();
        this.titulo = titulo;
        this.descripcion = descripcion;
        this.estado = 'Pendiente'; // Estado por defecto
    }

    actualizarEstado(nuevoEstado) {
        this.estado = nuevoEstado; // Mutador interno
    }
}
```

### 2. `api.js` (Capa de Servicios de Red y Latencias)
Totalmente aislado del DOM, este documento maneja el entorno de la nube y promesas:
- **Helpers de Red:** Integra funciones como `simularPeticionRed(ms)` que envuelven `setTimeout()` en **Promesas** (`Promise`) para bloquear los botones al enviar el formulario.
- **Objeto Estático `APIServicios`:** Reúne los procesos asíncronos consumiendo la API de "JSONPlaceholder" de forma controlada.

**✏️ Ejemplo de Consumo de API (fetch) y Asincronía:**
```javascript
const APIServicios = {
    // Método GET ficticio empleando async/await y manejor de errores try/catch
    obtenerTareasSimuladas: async () => {
        try {
            const respuesta = await fetch('https://jsonplaceholder.typicode.com/todos?_limit=4');
            if (!respuesta.ok) throw new Error("HTTP Status Error");
            return await respuesta.json(); 
        } catch (error) {
            console.error("Fallo comunicándose con JSONPlaceholder:", error);
            throw error; 
        }
    }
}
```

### 3. `app.js` (Capa D.O.M y Eventos de Usuario)
Es el hilo conductor primario (la Vista). Se asume la responsabilidad de procesar las interacciones que un usuario realiza frente al navegador:
- **Instanciación:** Inicia el proyecto llamando dinámicamente al objeto `GestorTareas`.
- **Event Listeners Múltiples:** Escucha asíncronamente el `submit` del modal e intercepta el `keyup` en el buscador general.
- **Renderizado Dinámico y ES6+:** Imprime las tareas al DOM evaluando Template Literals condicionales. 

**✏️ Ejemplo de Manipulación DOM, Eventos y ES6+:**
```javascript
// Captura del Evento Submit con asíncronía (Arrow Function)
formularioTarea.addEventListener('submit', async (e) => {
    e.preventDefault();
    const titulo = document.getElementById('inputTitulo').value;
    const btnSubmit = formularioTarea.querySelector('button[type="submit"]');

    // 1. Cargando y bloqueando el DOM
    btnSubmit.disabled = true;

    // 2. Asincronía: Retardo simulado de 2 segundos antes de enviar
    await simularPeticionRed(2000); 

    // 3. Sintaxis ES6 Mejorada en paso de Parámetros (Shorthand Property)
    await gestor.agregarTarea({ titulo, descripcion, prioridad, fechaLimite });
    
    // 4. Repintando el DOM interactivo
    renderizarTareas();
});

// Template Literals y manipulación en Render
const renderizarTareas = () => {
    /* ... Filtros y mapeo ... */
    columnaPendiente.innerHTML += `
        <div class="card id-${tarea.id}">
            <h6>${tarea.titulo}</h6>
        </div>`;
};
```

---


---

## 🚀 Instalación y Ejecución Local

Para probar e interactuar con la aplicación en tu entorno local:

1. Clonar este contenido de modo que asegures poseer los 5 archivos base (`index.html`, `styles.css`, `app.js`, `api.js` y `clases.js`) en el mismo origen.
2. Abre directamente el archivo principal **`index.html`** arrastrándolo a la Pestaña o Barra de búsquedas en tu explorador Web preferido (Compatible con Chrome, Edge, Firefox).
3. *(Alternativa Sugerida)*: Para mejor fluidez en red y evasión de CORS (origin policy), ábrelo corriendo un servidor web local liviano (Ej: la extensión **"Live Server"** de VSCode).

> 
