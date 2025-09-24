// Substitua 'URL_DO_SEU_APPS_SCRIPT' pelo URL de implantação do seu script.
const appsScriptUrl = 'https://script.google.com/macros/s/AKfycbxPO4_JBQ2VxQCu1FnrPNSIc2S1GnjkggYeOuObDSvz1m7Vg0lLbAaPhgyKM6LCRGRLFA/exec';
let liveDataInterval;
let currentPeriod = 'live';
let myChart;

// Mapeamento dos períodos para os títulos
const periodTitles = {
    'live': 'Dados Atuais',
    'day': 'Histórico de 1 Dia',
    'week': 'Histórico de 7 Dias',
    'month': 'Histórico de 1 Mês',
    'sixMonths': 'Histórico de 6 Meses',
    'year': 'Histórico de 1 Ano'
};

// Função para buscar os dados do Apps Script
async function fetchData(period = 'live') {
    try {
        const url = `${appsScriptUrl}?period=${period}`;
        const response = await fetch(url);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Erro ao buscar dados:', error);
        return null;
    }
}

// Função para exibir os dados nos cards
function displayData(data) {
    if (data && data.live) {
        document.getElementById('temp-value').textContent = data.live.temperature + ' °C';
        document.getElementById('humidity-value').textContent = data.live.humidity + ' %';
        document.getElementById('gas-value').textContent = data.live.gas + ' %';
    } else {
        document.getElementById('temp-value').textContent = '-°C';
        document.getElementById('humidity-value').textContent = '-%';
        document.getElementById('gas-value').textContent = '-%';
    }
}

// Função para criar/atualizar o gráfico
function createChart(data) {
    if (myChart) {
        myChart.destroy(); // Destrói o gráfico anterior se ele existir
    }

    const labels = data.map(item => item.timestamp);
    const temperatures = data.map(item => item.temperature);
    const humidities = data.map(item => item.humidity);
    const gases = data.map(item => item.gas);

    const ctx = document.getElementById('data-chart').getContext('2d');
    myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Temperatura (°C)',
                data: temperatures,
                borderColor: '#6aff6a',
                backgroundColor: 'rgba(106, 255, 106, 0.1)',
                fill: true,
                tension: 0.3
            }, {
                label: 'Umidade (%)',
                data: humidities,
                borderColor: '#048b04',
                backgroundColor: 'rgba(4, 139, 4, 0.1)',
                fill: true,
                tension: 0.3
            }, {
                label: 'Gás (%)',
                data: gases,
                borderColor: '#004d00',
                backgroundColor: 'rgba(0, 77, 0, 0.1)',
                fill: true,
                tension: 0.3
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    display: true,
                    title: {
                        display: true,
                        text: 'Tempo'
                    },
                    grid: { color: 'rgba(106, 255, 106, 0.2)' }
                },
                y: {
                    display: true,
                    title: {
                        display: true,
                        text: 'Valor'
                    },
                    grid: { color: 'rgba(106, 255, 106, 0.2)' }
                }
            },
            plugins: {
                legend: { labels: { color: '#6aff6a' } }
            }
        }
    });
}

// Inicia o monitoramento ao vivo
function startLiveMonitoring() {
    stopLiveMonitoring();
    liveDataInterval = setInterval(async () => {
        const data = await fetchData();
        if (data) {
            displayData(data);
        }
    }, 5000);
}

// Para o monitoramento ao vivo
function stopLiveMonitoring() {
    if (liveDataInterval) {
        clearInterval(liveDataInterval);
    }
}

// Transição da tela de boas-vindas para o dashboard
function transitionToDashboard() {
    const welcomeScreen = document.getElementById('welcome-screen');
    const mainDashboard = document.getElementById('main-dashboard');

    welcomeScreen.classList.remove('active');
    mainDashboard.classList.add('active');
}

// Lida com a seleção dos botões de período
document.querySelectorAll('.period-btn').forEach(button => {
    button.addEventListener('click', async () => {
        document.querySelectorAll('.period-btn').forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');

        const period = button.dataset.period;
        currentPeriod = period;

        const dataContainer = document.getElementById('data-container');
        const chartContainer = document.getElementById('chart-container');
        const titleElement = document.querySelector('#data-container h2');
        const chartTitleElement = document.querySelector('#chart-container h2');

        titleElement.innerHTML = `<i class="fas fa-chart-line"></i> Dados Atuais`;
        chartTitleElement.innerHTML = `<i class="fas fa-chart-line"></i> ${periodTitles[period]}`;

        if (period === 'live') {
            dataContainer.style.display = 'block';
            chartContainer.style.display = 'none';
            startLiveMonitoring();
            const data = await fetchData();
            if (data) {
                displayData(data);
            }
        } else {
            dataContainer.style.display = 'none';
            chartContainer.style.display = 'block';
            stopLiveMonitoring();
            const data = await fetchData(period);
            if (data && data.history) {
                createChart(data.history);
            }
        }
    });
});

// Adiciona a funcionalidade ao novo botão de recarregar
document.getElementById('refresh-btn').addEventListener('click', async () => {
    const data = await fetchData();
    if (data) {
        displayData(data);
    }
});

// Lógica principal: exibe o botão após 3 segundos e espera o clique
document.addEventListener('DOMContentLoaded', () => {
    const startBtn = document.getElementById('start-btn');

    // Mostra o botão após 3 segundos
    setTimeout(() => {
        startBtn.classList.remove('hidden');
    }, 3000);

    // Adiciona o evento de clique ao botão
    startBtn.addEventListener('click', async () => {
        transitionToDashboard();

        const data = await fetchData();
        if (data) {
            displayData(data);
        }
        startLiveMonitoring();
    });
});
