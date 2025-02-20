// Verifica si la API está disponible
async function verificarAPI() {
    const estadoAPI = document.getElementById("estadoAPI");
    try {
        const response = await fetch("https://mindicador.cl/api/");
        if (!response.ok) throw new Error(`Error ${response.status}`);

        estadoAPI.innerText = "✅ API en línea";
        estadoAPI.classList.remove("text-gray-700", "text-red-500");
        estadoAPI.classList.add("text-green-600");
        return true;
    } catch (error) {
        console.warn("❌ La API no está disponible:", error);
        estadoAPI.innerText = "⚠️ API caída. Usando datos locales.";
        estadoAPI.classList.remove("text-gray-700", "text-green-600");
        estadoAPI.classList.add("text-red-500");
        return false;
    }
}

// Función para convertir moneda
async function convertir() {
    console.log("Función convertir ejecutada");

    const monto = document.getElementById("monto").value;
    const moneda = document.getElementById("moneda").value;
    const resultado = document.getElementById("resultado");

    if (!monto || monto <= 0) {
        resultado.innerText = "⚠️ Ingrese un monto válido.";
        resultado.classList.add("text-red-500");
        return;
    }

    resultado.classList.remove("text-red-500");

    const apiDisponible = await verificarAPI();

    try {
        let data;
        if (apiDisponible) {
            const response = await fetch(`https://mindicador.cl/api/${moneda}`);
            if (!response.ok) throw new Error("Error en la API");

            data = await response.json();
        } else {
            // Carga datos locales en caso de que la API esté caída
            const localData = await fetch("offline.json").then(res => res.json());
            data = localData[moneda];
        }

        mostrarResultados(data, monto, moneda);
    } catch (error) {
        console.error("Error al obtener los datos:", error);
        resultado.innerText = "❌ No se pudo obtener los datos. Inténtalo más tarde.";
        resultado.classList.add("text-red-500");
    }
}

// Muestra los resultados en pantalla
function mostrarResultados(data, monto, moneda) {
    const resultado = document.getElementById("resultado");
    const valorMoneda = data.serie[0].valor;
    
    // Cálculo corregido: pesos chilenos a la moneda seleccionada
    const conversion = (monto / valorMoneda).toFixed(2);
    resultado.innerText = `💰 ${monto} CLP = ${conversion} ${moneda.toUpperCase()}`;
    resultado.classList.add("text-gray-800");

    // Renderizar el gráfico
    renderizarGrafico(data.serie.slice(0, 10));
}

// Función para renderizar el gráfico con Chart.js
function renderizarGrafico(data) {
    const ctx = document.getElementById("grafico").getContext("2d");
    const labels = data.map(entry => new Date(entry.fecha).toLocaleDateString());
    const valores = data.map(entry => entry.valor);

    // Limpiar gráfico anterior si existe
    if (window.myChart) {
        window.myChart.destroy();
    }

    // Crear nuevo gráfico con opciones mejoradas
    window.myChart = new Chart(ctx, {
        type: "line",
        data: {
            labels: labels.reverse(),
            datasets: [{
                label: "Valor últimos 10 días",
                data: valores.reverse(),
                borderColor: "#2563eb",
                backgroundColor: "rgba(37, 99, 235, 0.2)",
                borderWidth: 2,
                fill: true,
                tension: 0.3 // Suaviza la curva
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: true }
            },
            scales: {
                x: { grid: { display: false } },
                y: { grid: { color: "rgba(200, 200, 200, 0.2)" } }
            }
        }
    });
}

// Ejecutar la verificación de la API al cargar la página
window.onload = verificarAPI;
