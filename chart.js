function renderizarGrafico(data) {
    const ctx = document.getElementById("grafico").getContext("2d");
    const labels = data.map(entry => new Date(entry.fecha).toLocaleDateString());
    const valores = data.map(entry => entry.valor);

    new Chart(ctx, {
        type: "line",
        data: {
            labels: labels.reverse(),
            datasets: [{
                label: "Valor en los últimos 10 días",
                data: valores.reverse(),
                borderColor: "blue",
                borderWidth: 1
            }]
        }
    });
}
