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

  // Calcular métricas Time A
  const pontosA = (vitoriasA * 3) + empatesA;
  const aproveitamentoA = jogosA > 0 ? (pontosA / (jogosA * 3)) * 100 : 0;
  const ataqueRawA = jogosA > 0 ? gmA / jogosA : 0;
  const defesaRawA = jogosA > 0 ? gsA / jogosA : 0;
  const saldoRawA = jogosA > 0 ? (gmA - gsA) / jogosA : 0;

  // Normalizar Time A
  const ataqueNormA = normalizar(ataqueRawA, 0, 3.5);
  const defesaNormA = 100 - normalizar(defesaRawA, 0, 3.5);
  const saldoNormA = normalizar(saldoRawA, -2, 2);
  const pontosNormA = normalizar(pontosA, 0, jogosA * 3);

  // Calcular métricas Time B
  const pontosB = (vitoriasB * 3) + empatesB;
  const aproveitamentoB = jogosB > 0 ? (pontosB / (jogosB * 3)) * 100 : 0;
  const ataqueRawB = jogosB > 0 ? gmB / jogosB : 0;
  const defesaRawB = jogosB > 0 ? gsB / jogosB : 0;
  const saldoRawB = jogosB > 0 ? (gmB - gsB) / jogosB : 0;

  // Normalizar Time B
  const ataqueNormB = normalizar(ataqueRawB, 0, 3.5);
  const defesaNormB = 100 - normalizar(defesaRawB, 0, 3.5);
  const saldoNormB = normalizar(saldoRawB, -2, 2);
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

  atualizarResultados(nomeAText, nomeBText, forceA, forceB, probVitA, probVitB, probEmpate, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
}

function criarRadar(labels, dataA, dataB, nomeA, nomeB) {
  if (radarChart) radarChart.destroy();

  const fontFamily = "'DM Sans', system-ui, sans-serif";
  radarChart = new Chart(document.getElementById("radar"), {
    type: "radar",
    data: {
      labels,
      datasets: [
        {
          label: nomeA,
          data: dataA,
          backgroundColor: "rgba(37, 99, 235, 0.22)",
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
          backgroundColor: "rgba(225, 29, 72, 0.18)",
          borderColor: "#e11d48",
          borderWidth: 2.5,
          pointBackgroundColor: "#e11d48",
          pointBorderColor: "#fff",
          pointBorderWidth: 2,
          pointHoverBackgroundColor: "#fff",
          pointHoverBorderColor: "#e11d48",
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
