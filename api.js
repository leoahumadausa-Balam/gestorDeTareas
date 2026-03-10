// api.js (Capa de Servicios y Red - Data Transfer)

// Función genérica para simular latencia
const simularPeticionRed = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
};

// Objeto Controlador de las peticiones remotas
const APIServicios = {
    // Método GET ficticio
    obtenerTareasSimuladas: async () => {
        try {
            const respuesta = await fetch('https://jsonplaceholder.typicode.com/todos?_limit=4');
            if (!respuesta.ok) throw new Error("HTTP Status Error");
            return await respuesta.json(); // Data cruda de la API externa
        } catch (error) {
            console.error("Fallo comunicándose con JSONPlaceholder:", error);
            throw error; // Lanza el error al Caller (El Gestor)
        }
    },

    // Método POST ficticio
    guardarTareaSimulada: async (titulo) => {
        try {
            const peticionNube = await fetch('https://jsonplaceholder.typicode.com/todos', {
                method: 'POST',
                body: JSON.stringify({ title: titulo, completed: false, userId: 1 }),
                headers: { 'Content-type': 'application/json; charset=UTF-8' },
            });
            if (!peticionNube.ok) throw new Error("Fallo en sincronización cloud");
            const dataGuardada = await peticionNube.json();
            console.info("Simulación POST a API exitosa:", dataGuardada);
            return dataGuardada;
        } catch (error) {
            console.error("Error transmitiendo POST:", error);
            throw error;
        }
    }
};
