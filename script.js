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

// ===== CALCULAR POSSÍVEIS RESULTADOS (MATRIZ POISSON) =====
function calcularPoissonMatrix(xgA, xgB) {
  const probPoisson = (lambda, k) => {
    const fatorial = (n) => n <= 1 ? 1 : n * fatorial(n - 1);
    if (lambda === 0) return k === 0 ? 1 : 0;
    return (Math.pow(lambda, k) * Math.exp(-lambda)) / fatorial(k);
  };

  let winA = 0, draw = 0, winB = 0;
  let over15 = 0, over25 = 0, btts = 0;
  let csA = 0, csB = 0;
  
  const scores = [];

  for (let gA = 0; gA <= 5; gA++) {
    for (let gB = 0; gB <= 5; gB++) {
      const prob = probPoisson(xgA, gA) * probPoisson(xgB, gB);
      
      scores.push({ placar: `${gA}–${gB}`, prob: prob * 100 });

      if (gA > gB) winA += prob;
      else if (gA === gB) draw += prob;
      else winB += prob;

      if (gA + gB > 1.5) over15 += prob;
      if (gA + gB > 2.5) over25 += prob;
      if (gA > 0 && gB > 0) btts += prob;
      
      // Clean sheet refers to NOT conceding goals.
      // So Clean Sheet A = B scores 0.
      if (gB === 0) csA += prob;
      // Clean Sheet B = A scores 0.
      if (gA === 0) csB += prob;
    }
  }

  // Normalizar soma para 100% (cobre o pequeno residual > 5 gols)
  const totalWDL = winA + draw + winB || 1;

  return {
    winA: (winA / totalWDL) * 100,
    draw: (draw / totalWDL) * 100,
    winB: (winB / totalWDL) * 100,
    over15: over15 * 100,
    over25: over25 * 100,
    btts: btts * 100,
    csA: csA * 100,
    csB: csB * 100,
    topScores: scores.sort((a, b) => b.prob - a.prob).slice(0, 3)
  };
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

  // Novos Inputs Time A
  const mandoValA = Number(document.getElementById("mandoA").value) ?? 1;
  const formaValA = Number(document.getElementById("formaA").value) || 0;
  const advValA = Number(document.getElementById("advA").value) || 3;

  // Novos Inputs Time B
  const mandoValB = Number(document.getElementById("mandoB").value) ?? 0;
  const formaValB = Number(document.getElementById("formaB").value) || 0;
  const advValB = Number(document.getElementById("advB").value) || 3;

  // Calcular métricas Time A
  const pontosA = (vitoriasA * 3) + empatesA;
  const aproveitamentoA = jogosA > 0 ? (pontosA / (jogosA * 3)) * 100 : 0;
  let ataqueRawA = jogosA > 0 ? gmA / jogosA : 0;
  let defesaRawA = jogosA > 0 ? gsA / jogosA : 0;
  let saldoRawA = jogosA > 0 ? (gmA - gsA) / jogosA : 0;

  ataqueRawA = Math.min(ataqueRawA, 3);
  defesaRawA = Math.min(defesaRawA, 3);
  saldoRawA = Math.max(-3, Math.min(saldoRawA, 3));

  const ataqueNormA = normalizar(ataqueRawA, 0, 3);
  const defesaNormA = 100 - normalizar(defesaRawA, 0, 3);
  const saldoNormA = normalizar(saldoRawA, -3, 3);
  const pontosNormA = normalizar(pontosA, 0, jogosA * 3);

  // Calcular métricas Time B
  const pontosB = (vitoriasB * 3) + empatesB;
  const aproveitamentoB = jogosB > 0 ? (pontosB / (jogosB * 3)) * 100 : 0;
  let ataqueRawB = jogosB > 0 ? gmB / jogosB : 0;
  let defesaRawB = jogosB > 0 ? gsB / jogosB : 0;
  let saldoRawB = jogosB > 0 ? (gmB - gsB) / jogosB : 0;

  ataqueRawB = Math.min(ataqueRawB, 3);
  defesaRawB = Math.min(defesaRawB, 3);
  saldoRawB = Math.max(-3, Math.min(saldoRawB, 3));

  const ataqueNormB = normalizar(ataqueRawB, 0, 3);
  const defesaNormB = 100 - normalizar(defesaRawB, 0, 3);
  const saldoNormB = normalizar(saldoRawB, -3, 3);
  const pontosNormB = normalizar(pontosB, 0, jogosB * 3);

  // === CAMADA 1: NOVO ÍNDICE DE FORÇA ===
  const forceA = (aproveitamentoA * 0.25) + 
                 (ataqueNormA * 0.20) + 
                 (defesaNormA * 0.20) + 
                 (mandoValA * 15) + 
                 ((Math.min(formaValA, 9) / 9) * 10) + 
                 ((advValA / 5) * 10);

  const forceB = (aproveitamentoB * 0.25) + 
                 (ataqueNormB * 0.20) + 
                 (defesaNormB * 0.20) + 
                 (mandoValB * 15) + 
                 ((Math.min(formaValB, 9) / 9) * 10) + 
                 ((advValB / 5) * 10);

  // === CAMADA 2: GOLS ESPERADOS (xG) ===
  const MEDIA_LIGA = 1.35; // Média global de gols assumida
  
  // Base xG
  let xgBaseA = ataqueRawA > 0 && defesaRawB > 0 ? ataqueRawA * (defesaRawB / MEDIA_LIGA) : MEDIA_LIGA;
  let xgBaseB = ataqueRawB > 0 && defesaRawA > 0 ? ataqueRawB * (defesaRawA / MEDIA_LIGA) : MEDIA_LIGA;

  // Ajuste fino com o Índice de Força (SI)
  const diffA = forceA - forceB;
  xgBaseA = xgBaseA * (1 + (diffA * 0.005));
  
  const diffB = forceB - forceA;
  xgBaseB = xgBaseB * (1 + (diffB * 0.005));

  // Ajuste do Mando de Campo no xG
  xgBaseA = xgBaseA * (1 + (mandoValA === 1 ? 0.15 : (mandoValA === 0 ? -0.05 : 0.05)));
  xgBaseB = xgBaseB * (1 + (mandoValB === 1 ? 0.15 : (mandoValB === 0 ? -0.05 : 0.05)));

  const xgA = Math.max(0.1, xgBaseA);
  const xgB = Math.max(0.1, xgBaseB);

  // === CAMADA 3: DISTRIBUIÇÃO DE POISSON ===
  const poisson = calcularPoissonMatrix(xgA, xgB);

  // Dados do radar
  const labels = ["Ataque", "Defesa", "Aproveitamento", "Saldo", "Pontos"];
  const dataA = [ataqueNormA, defesaNormA, aproveitamentoA, saldoNormA, pontosNormA];
  const dataB = [ataqueNormB, defesaNormB, aproveitamentoB, saldoNormB, pontosNormB];

  criarRadar(labels, dataA, dataB, nomeAText, nomeBText);
  
  // Exibir placares
  exibirResultados(poisson.topScores);
  
  atualizarResultados(
    nomeAText, nomeBText,
    forceA, forceB,
    poisson.winA, poisson.winB, poisson.draw,
    aproveitamentoA, aproveitamentoB,
    ataqueRawA, ataqueRawB,
    defesaRawA, defesaRawB,
    saldoRawA, saldoRawB,
    pontosA, pontosB,
    xgA, xgB,
    poisson.csA, poisson.csB,
    poisson.over15, poisson.over25, poisson.btts
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

  // Para HT, faremos um xG derivado puramente das estatísticas de intervalo
  const xgHT_A = Math.max(0.1, (forceA / 50) * 0.8);
  const xgHT_B = Math.max(0.1, (forceB / 50) * 0.8);

  const poisson = calcularPoissonMatrix(xgHT_A, xgHT_B);
  exibirResultados(poisson.topScores);

  atualizarResultados(
    nomeAText, nomeBText, 
    forceA, forceB, 
    poisson.winA, poisson.winB, poisson.draw, 
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    xgHT_A, xgHT_B, poisson.csA, poisson.csB, poisson.over15, poisson.over25, poisson.btts
  );
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
          backgroundColor: "rgba(37, 99, 235, 0.15)",
          borderColor: "#2563eb",
          borderWidth: 2.5,
          pointBackgroundColor: "#2563eb",
          pointBorderColor: "#fff",
          pointBorderWidth: 2,
          pointHoverBackgroundColor: "#fff",
          pointHoverBorderColor: "#2563eb",
          pointHoverBorderWidth: 3,
          pointRadius: 5,
          pointHoverRadius: 7
        },
        {
          label: nomeB,
          data: dataB,
          backgroundColor: "rgba(239, 68, 68, 0.15)",
          borderColor: "#ef4444",
          borderWidth: 2.5,
          pointBackgroundColor: "#ef4444",
          pointBorderColor: "#fff",
          pointBorderWidth: 2,
          pointHoverBackgroundColor: "#fff",
          pointHoverBorderColor: "#ef4444",
          pointHoverBorderWidth: 3,
          pointRadius: 5,
          pointHoverRadius: 7
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
            font: { family: fontFamily, size: 11, weight: "500" },
            color: "#64748b"
          },
          grid: { color: "rgba(100, 116, 139, 0.15)" },
          angleLines: { color: "rgba(100, 116, 139, 0.1)" },
          pointLabels: {
            font: { family: fontFamily, size: 12, weight: "600" },
            color: "#334155",
            padding: 8
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
            color: "#0f172a",
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

function atualizarResultados(nomeA, nomeB, forceA, forceB, probVitA, probVitB, probEmpate, aproA, aproB, atkA, atkB, defA, defB, saldoA, saldoB, ptosA, ptosB, xgA, xgB, csA, csB, probOver15, probOver25, probBTTS) {
  // Atualizar nomes nos resultados
  document.getElementById("forceTeamA").textContent = nomeA;
  document.getElementById("forceTeamB").textContent = nomeB;
  document.getElementById("probLabelA").textContent = `Vitória ${nomeA}`;
  document.getElementById("probLabelB").textContent = `Vitória ${nomeB}`;
  
  if (document.getElementById("statsTeamA")) {
    document.getElementById("statsTeamA").textContent = nomeA;
    document.getElementById("statsTeamB").textContent = nomeB;
    document.getElementById("xgTeamA").textContent = nomeA;
    document.getElementById("xgTeamB").textContent = nomeB;
  }

  // Atualizar Índice de Força
  document.getElementById("forceBarA").style.width = Math.min(100, forceA) + "%";
  document.getElementById("forceValueA").textContent = forceA.toFixed(1);
  
  document.getElementById("forceBarB").style.width = Math.min(100, forceB) + "%";
  document.getElementById("forceValueB").textContent = forceB.toFixed(1);

  // Atualizar Probabilidades (Poisson)
  document.getElementById("probValueA").textContent = probVitA.toFixed(1) + "%";
  document.getElementById("probBarA").style.width = probVitA + "%";
  
  document.getElementById("probValueDraw").textContent = probEmpate.toFixed(1) + "%";
  document.getElementById("probBarDraw").style.width = probEmpate + "%";
  
  document.getElementById("probValueB").textContent = probVitB.toFixed(1) + "%";
  document.getElementById("probBarB").style.width = probVitB + "%";

  // Atualizar Novos Mercados
  if (document.getElementById("xgA")) {
    document.getElementById("xgA").textContent = xgA.toFixed(2);
    document.getElementById("xgB").textContent = xgB.toFixed(2);
    document.getElementById("csA").textContent = csA.toFixed(1) + "%";
    document.getElementById("csB").textContent = csB.toFixed(1) + "%";
    document.getElementById("probOver15").textContent = probOver15.toFixed(1) + "%";
    document.getElementById("probOver25").textContent = probOver25.toFixed(1) + "%";
    document.getElementById("probBTTS").textContent = probBTTS.toFixed(1) + "%";
  }

  // Atualizar Estatísticas (apenas se estiver em modo PRÉ)
  if (modoAtual === "PRE" && document.getElementById("estatAproA")) {
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
