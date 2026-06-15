let modoAtual = "PRE";
let radarChart = null;

const btnPre = document.getElementById("btn_pre");
const btnHT = document.getElementById("btn_ht");
const boxTimeA = document.getElementById("box_time_a");
const boxTimeB = document.getElementById("box_time_b");
const boxHT = document.getElementById("box_ht");
const btn_calcular = document.getElementById("btn_calcular");
const btn_download = document.getElementById("btn_download");
const areaResultado = document.getElementById("areaResultado");
const descricaoImagem = document.getElementById("descricaoImagem");
const rodapeImagem = document.getElementById("rodapeImagem");

boxHT.style.display = "none";

btnPre.onclick = () => trocarModo("PRE");
btnHT.onclick = () => trocarModo("HT");

function trocarModo(modo) {
  modoAtual = modo;
  btnPre.classList.toggle("ativo", modo === "PRE");
  btnHT.classList.toggle("ativo", modo === "HT");
  btnPre.setAttribute("aria-selected", modo === "PRE" ? "true" : "false");
  btnHT.setAttribute("aria-selected", modo === "HT" ? "true" : "false");
  boxTimeA.style.display = modo === "PRE" ? "block" : "none";
  boxTimeB.style.display = modo === "PRE" ? "block" : "none";
  boxHT.style.display = modo === "HT" ? "block" : "none";
}

btn_calcular.onclick = () => modoAtual === "PRE" ? calcularPre() : calcularHT();

function ler(id) {
  return Number(document.getElementById(id).value) || 0;
}

// ===== CALCULAR POSSÍVEIS RESULTADOS =====
function calcularResultados(ataqueA, defesaA, ataqueB, defesaB) {
  // Média esperada de gols para cada time usando Poisson
  const golsEsperadosA = ataqueA * (1 - (defesaB / 100));
  const golsEsperadosB = ataqueB * (1 - (defesaA / 100));

  // Calcular probabilidades de Poisson simplificadas para 0-3 gols (cap de 3)
  const probPoisson = (lambda, k) => {
    if (lambda === 0) return k === 0 ? 1 : 0;
    return (Math.pow(lambda, k) * Math.exp(-lambda)) / fatorial(k);
  };

  const fatorial = (n) => n <= 1 ? 1 : n * fatorial(n - 1);

  // Gerar todos os possíveis resultados com suas probabilidades (máx 3 gols por time)
  const resultados = [];
  for (let gA = 0; gA <= GOLS_CAP; gA++) {
    for (let gB = 0; gB <= GOLS_CAP; gB++) {
      const prob = probPoisson(golsEsperadosA, gA) * probPoisson(golsEsperadosB, gB);
      resultados.push({
        placar: `${gA}–${gB}`,
        golsA: gA,
        golsB: gB,
        prob: prob * 100
      });
    }
  }

  // Ordenar por probabilidade e pegar os 3 maiores
  const top3 = resultados.sort((a, b) => b.prob - a.prob).slice(0, 3);
  return top3;
}

function exibirResultados(resultados) {
  const outcomesGrid = document.getElementById("outcomesGrid");
  const items = outcomesGrid.querySelectorAll(".outcome-item");
  
  items.forEach((item, index) => {
    if (resultados[index]) {
      item.querySelector(".outcome-score").textContent = resultados[index].placar;
      item.querySelector(".outcome-prob").textContent = resultados[index].prob.toFixed(1) + "%";
    }
  });
}

// ===== NORMALIZAÇÃO =====
function normalizar(valor, min, max) {
  if (max - min === 0) return 50;
  return Math.max(0, Math.min(100, ((valor - min) / (max - min)) * 100));
}

// ===== RETORNO DECRESCENTE DE GOLS =====
// Dado uma média bruta de gols por jogo (lambda), calcula a média efetiva
// limitando a no máximo CAP gols por partida, usando distribuição de Poisson.
// Isso modela o retorno decrescente: marcar 2 gols vale muito,
// mas o 6º, 7º ou 8º gol na mesma partida têm peso cada vez menor.
// E[min(X, cap)] = sum(k=0..cap-1) k*P(X=k) + cap*P(X>=cap)
function golsComRetornoDecrescente(mediaRaw, cap) {
  if (mediaRaw <= 0) return 0;
  const lambda = mediaRaw;

  // Função Poisson P(X = k)
  const poissonPMF = (k) => {
    if (lambda === 0) return k === 0 ? 1 : 0;
    let logP = -lambda + k * Math.log(lambda);
    for (let i = 2; i <= k; i++) logP -= Math.log(i);
    return Math.exp(logP);
  };

  // E[min(X, cap)] = Σ k * P(X=k) para k=0..cap-1, + cap * P(X >= cap)
  let esperado = 0;
  let somaProb = 0; // Σ P(X=k) para k=0..cap-1
  for (let k = 0; k < cap; k++) {
    const p = poissonPMF(k);
    esperado += k * p;
    somaProb += p;
  }
  // P(X >= cap) = 1 - Σ P(X=k) para k=0..cap-1
  esperado += cap * (1 - somaProb);

  return esperado;
}

const GOLS_CAP = 3; // Máximo de gols considerados por partida

// ===== CÁLCULOS PRÉ-JOGO =====
function calcularPre() {
  const nomeAText = document.getElementById("nomeA").value || "Time A";
  const nomeBText = document.getElementById("nomeB").value || "Time B";

  // Time A
  const jogosA = ler("jogosA");
  const vitoriasA = ler("vitoriasA");
  const empatesA = ler("empatesA");
  const derrotasA = ler("derrotasA");
  const gmA = ler("gmA");
  const gsA = ler("gsA");

  // Time B
  const jogosB = ler("jogosB");
  const vitoriasB = ler("vitoriasB");
  const empatesB = ler("empatesB");
  const derrotasB = ler("derrotasB");
  const gmB = ler("gmB");
  const gsB = ler("gsB");

  // Médias brutas de gols por jogo
  const ataqueRawBrutoA = jogosA > 0 ? gmA / jogosA : 0;
  const defesaRawBrutaA = jogosA > 0 ? gsA / jogosA : 0;
  const ataqueRawBrutoB = jogosB > 0 ? gmB / jogosB : 0;
  const defesaRawBrutaB = jogosB > 0 ? gsB / jogosB : 0;

  // Calcular métricas Time A (com retorno decrescente, cap de 3 gols/jogo)
  const pontosA = (vitoriasA * 3) + empatesA;
  const aproveitamentoA = jogosA > 0 ? (pontosA / (jogosA * 3)) * 100 : 0;
  const ataqueRawA = golsComRetornoDecrescente(ataqueRawBrutoA, GOLS_CAP);
  const defesaRawA = golsComRetornoDecrescente(defesaRawBrutaA, GOLS_CAP);
  const saldoRawA = ataqueRawA - defesaRawA;

  // Normalizar Time A (max ajustado para o cap de 3)
  const ataqueNormA = normalizar(ataqueRawA, 0, GOLS_CAP);
  const defesaNormA = 100 - normalizar(defesaRawA, 0, GOLS_CAP);
  const saldoNormA = normalizar(saldoRawA, -GOLS_CAP, GOLS_CAP);
  const pontosNormA = normalizar(pontosA, 0, jogosA * 3);

  // Calcular métricas Time B (com retorno decrescente, cap de 3 gols/jogo)
  const pontosB = (vitoriasB * 3) + empatesB;
  const aproveitamentoB = jogosB > 0 ? (pontosB / (jogosB * 3)) * 100 : 0;
  const ataqueRawB = golsComRetornoDecrescente(ataqueRawBrutoB, GOLS_CAP);
  const defesaRawB = golsComRetornoDecrescente(defesaRawBrutaB, GOLS_CAP);
  const saldoRawB = ataqueRawB - defesaRawB;

  // Normalizar Time B (max ajustado para o cap de 3)
  const ataqueNormB = normalizar(ataqueRawB, 0, GOLS_CAP);
  const defesaNormB = 100 - normalizar(defesaRawB, 0, GOLS_CAP);
  const saldoNormB = normalizar(saldoRawB, -GOLS_CAP, GOLS_CAP);
  const pontosNormB = normalizar(pontosB, 0, jogosB * 3);

  // Calcular Índice de Força
  const forceA = (ataqueNormA * 0.40) + (defesaNormA * 0.30) + (aproveitamentoA * 0.30);
  const forceB = (ataqueNormB * 0.40) + (defesaNormB * 0.30) + (aproveitamentoB * 0.30);

  // Calcular probabilidades
  const somaForces = forceA + forceB || 1;
  let probVitA = (forceA / somaForces) * 100;
  let probVitB = (forceB / somaForces) * 100;
  const probEmpate = 25; // 25% reservado para empate

  // Ajustar proporcionalmente
  probVitA = (probVitA / 100) * 75;
  probVitB = (probVitB / 100) * 75;

  // Dados do radar
  const labels = ["Ataque", "Defesa", "Aproveitamento", "Saldo", "Pontos"];
  const dataA = [ataqueNormA, defesaNormA, aproveitamentoA, saldoNormA, pontosNormA];
  const dataB = [ataqueNormB, defesaNormB, aproveitamentoB, saldoNormB, pontosNormB];

  criarRadar(labels, dataA, dataB, nomeAText, nomeBText);
  
  // Calcular e exibir possíveis resultados (usando médias com cap)
  const possiveisResultados = calcularResultados(ataqueRawA, defesaRawA * (100 / GOLS_CAP), ataqueRawB, defesaRawB * (100 / GOLS_CAP));
  exibirResultados(possiveisResultados);
  
  atualizarResultados(
    nomeAText, nomeBText,
    forceA, forceB,
    probVitA, probVitB, probEmpate,
    aproveitamentoA, aproveitamentoB,
    ataqueRawA, ataqueRawB,
    defesaRawA, defesaRawB,
    saldoRawA, saldoRawB,
    pontosA, pontosB
  );
}

// ===== CÁLCULOS INTERVALO =====
function calcularHT() {
  const labels = ["Domínio", "Pressão", "Perigo", "Eficiência", "Intensidade"];

  const A = [
    normalizar(ler("posseA") + ler("finalA") * 3, 20, 80),
    normalizar(ler("finalA") + ler("escA") * 2, 0, 20),
    normalizar(ler("finalA") * 0.7 + ler("golsA_ht") * 5, 0, 15),
    normalizar(ler("golsA_ht") / (ler("finalA") + 1), 0, 0.6),
    normalizar(ler("finalA") + ler("escA") + ler("cartA") * 1.5, 0, 25)
  ];

  const B = [
    normalizar(ler("posseB") + ler("finalB") * 3, 20, 80),
    normalizar(ler("finalB") + ler("escB") * 2, 0, 20),
    normalizar(ler("finalB") * 0.7 + ler("golsB_ht") * 5, 0, 15),
    normalizar(ler("golsB_ht") / (ler("finalB") + 1), 0, 0.6),
    normalizar(ler("finalB") + ler("escB") + ler("cartB") * 1.5, 0, 25)
  ];

  const nomeAText = document.getElementById("nomeA").value || "Time A";
  const nomeBText = document.getElementById("nomeB").value || "Time B";

  criarRadar(labels, A, B, nomeAText, nomeBText);

  // Para modo HT, usar as médias dos dados de força do modo pré
  const forceA = (A[2] * 0.40) + (100 - A[1] * 0.30) + (A[0] * 0.30);
  const forceB = (B[2] * 0.40) + (100 - B[1] * 0.30) + (B[0] * 0.30);

  const somaForces = forceA + forceB || 1;
  let probVitA = (forceA / somaForces) * 75;
  let probVitB = (forceB / somaForces) * 75;
  const probEmpate = 25;

  // Calcular e exibir possíveis resultados para HT (usando força como proxy de ataque/defesa)
  const possiveisResultados = calcularResultados(forceA / 20, 50, forceB / 20, 50);
  exibirResultados(possiveisResultados);

  atualizarResultados(nomeAText, nomeBText, forceA, forceB, probVitA, probVitB, probEmpate, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
}

function criarRadar(labels, dataA, dataB, nomeA, nomeB) {
  if (radarChart) radarChart.destroy();

  const fontFamily = "'Outfit', system-ui, sans-serif";
  radarChart = new Chart(document.getElementById("radar"), {
    type: "radar",
    data: {
      labels,
      datasets: [
        {
          label: nomeA,
          data: dataA,
          backgroundColor: "rgba(59, 130, 246, 0.2)",
          borderColor: "#3b82f6",
          borderWidth: 2.5,
          pointBackgroundColor: "#3b82f6",
          pointBorderColor: "#fff",
          pointBorderWidth: 2,
          pointHoverBackgroundColor: "#fff",
          pointHoverBorderColor: "#3b82f6",
          pointHoverBorderWidth: 3,
          pointRadius: 4,
          pointHoverRadius: 6
        },
        {
          label: nomeB,
          data: dataB,
          backgroundColor: "rgba(244, 63, 94, 0.2)",
          borderColor: "#f43f5e",
          borderWidth: 2.5,
          pointBackgroundColor: "#f43f5e",
          pointBorderColor: "#fff",
          pointBorderWidth: 2,
          pointHoverBackgroundColor: "#fff",
          pointHoverBorderColor: "#f43f5e",
          pointHoverBorderWidth: 3,
          pointRadius: 4,
          pointHoverRadius: 6
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      scales: {
        r: {
          min: 0,
          max: 100,
          ticks: {
            display: true,
            font: { family: fontFamily, size: 10, weight: "500" },
            color: "#7a85a8",
            backdropColor: "transparent"
          },
          grid: { color: "rgba(255, 255, 255, 0.05)" },
          angleLines: { color: "rgba(255, 255, 255, 0.1)" },
          pointLabels: {
            font: { family: fontFamily, size: 11, weight: "500" },
            color: "#e2e8f4",
            padding: 12
          }
        }
      },
      plugins: {
        legend: {
          position: "bottom",
          labels: {
            usePointStyle: true,
            pointStyle: "circle",
            padding: 18,
            font: { family: fontFamily, size: 13, weight: "500" },
            color: "#e2e8f4",
            boxWidth: 8
          }
        },
        tooltip: {
          titleFont: { family: fontFamily, size: 12, weight: "600" },
          bodyFont: { family: fontFamily, size: 12, weight: "500" },
          padding: 10,
          displayColors: true,
          backgroundColor: "rgba(15, 23, 42, 0.92)"
        }
      }
    }
  });
}

function atualizarResultados(nomeA, nomeB, forceA, forceB, probVitA, probVitB, probEmpate, aproA, aproB, atkA, atkB, defA, defB, saldoA, saldoB, ptosA, ptosB) {
  // Atualizar nomes nos resultados
  document.getElementById("forceTeamA").textContent = nomeA;
  document.getElementById("forceTeamB").textContent = nomeB;
  document.getElementById("probLabelA").textContent = `Vitória ${nomeA}`;
  document.getElementById("probLabelB").textContent = `Vitória ${nomeB}`;
  document.getElementById("statsTeamA").textContent = nomeA;
  document.getElementById("statsTeamB").textContent = nomeB;

  // Atualizar Índice de Força
  document.getElementById("forceBarA").style.width = forceA + "%";
  document.getElementById("forceValueA").textContent = forceA.toFixed(1);
  
  document.getElementById("forceBarB").style.width = forceB + "%";
  document.getElementById("forceValueB").textContent = forceB.toFixed(1);

  // Atualizar Probabilidades
  document.getElementById("probValueA").textContent = probVitA.toFixed(1) + "%";
  document.getElementById("probBarA").style.width = probVitA + "%";
  
  document.getElementById("probValueDraw").textContent = probEmpate.toFixed(1) + "%";
  document.getElementById("probBarDraw").style.width = probEmpate + "%";
  
  document.getElementById("probValueB").textContent = probVitB.toFixed(1) + "%";
  document.getElementById("probBarB").style.width = probVitB + "%";

  // Atualizar Estatísticas (apenas se estiver em modo PRÉ)
  if (modoAtual === "PRE") {
    document.getElementById("estatAproA").textContent = aproA.toFixed(1) + "%";
    document.getElementById("estatAproB").textContent = aproB.toFixed(1) + "%";
    
    document.getElementById("estatAtkA").textContent = atkA.toFixed(2);
    document.getElementById("estatAtkB").textContent = atkB.toFixed(2);
    
    document.getElementById("estatDefA").textContent = defA.toFixed(2);
    document.getElementById("estatDefB").textContent = defB.toFixed(2);
    
    document.getElementById("estatSaldoA").textContent = saldoA.toFixed(2);
    document.getElementById("estatSaldoB").textContent = saldoB.toFixed(2);
    
    document.getElementById("estatPtosA").textContent = ptosA.toFixed(0);
    document.getElementById("estatPtosB").textContent = ptosB.toFixed(0);
  }

  rodapeImagem.innerText = descricaoImagem.value;
}

/* ===== DOWNLOAD ===== */
btn_download.onclick = () => {
  html2canvas(areaResultado, {
    backgroundColor: "#ffffff",
    scale: 2
  }).then(canvas => {
    const link = document.createElement("a");
    link.download = "futstat-radar.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  });
};
