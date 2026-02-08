let modoAtual = "PRE";
let radarChart = null;

const btnPre = document.getElementById("btn_pre");
const btnHT = document.getElementById("btn_ht");

const boxTimeA = document.getElementById("box_time_a");
const boxTimeB = document.getElementById("box_time_b");
const boxHT = document.getElementById("box_ht");

boxHT.style.display = "none";

btnPre.onclick = () => trocarModo("PRE");
btnHT.onclick = () => trocarModo("HT");

function trocarModo(modo) {
  modoAtual = modo;

  btnPre.classList.toggle("ativo", modo === "PRE");
  btnHT.classList.toggle("ativo", modo === "HT");

  boxTimeA.style.display = modo === "PRE" ? "block" : "none";
  boxTimeB.style.display = modo === "PRE" ? "block" : "none";
  boxHT.style.display = modo === "HT" ? "block" : "none";

  atualizarLegenda([]);
}

document.getElementById("btn_calcular").onclick = () => {
  modoAtual === "PRE" ? calcularPreJogo() : calcularHT();
};

function ler(id) {
  return Number(document.getElementById(id).value) || 0;
}

function normalizar(v, min, max) {
  return Math.max(0, Math.min(100, ((v - min) / (max - min)) * 100));
}

/* ========= LEGENDA ========= */

const legendaTexto = {
  PRE: {
    Ataque: [
      "📈 Ataque forte → cria muitas chances e pressiona",
      "📉 Ataque fraco → dificuldade para criar e finalizar"
    ],
    Defesa: [
      "📈 Defesa forte → sofre poucas chances e gols",
      "📉 Defesa fraca → qualquer pressão vira perigo"
    ],
    Forma: [
      "📈 Forma alta → bom momento e confiança",
      "📉 Forma baixa → instabilidade e pressão"
    ],
    Eficiência: [
      "📈 Eficiência alta → cria pouco, mas machuca quando cria",
      "📉 Eficiência baixa → ataca, mas desperdiça muito"
    ],
    Consistência: [
      "📈 Consistência alta → mantém padrão de jogo",
      "📉 Consistência baixa → oscila muito"
    ]
  },

  HT: {
    Domínio: [
      "📈 Domínio alto → controla o jogo",
      "📉 Domínio baixo → sofre imposição"
    ],
    Pressão: [
      "📈 Pressão alta → força erros e escanteios",
      "📉 Pressão baixa → pouco volume ofensivo"
    ],
    Perigo: [
      "📈 Perigo alto → cria chances reais de gol",
      "📉 Perigo baixo → pouco ameaça"
    ],
    Eficiência: [
      "📈 Eficiência alta → converte chances em gol",
      "📉 Eficiência baixa → finaliza sem precisão"
    ],
    Intensidade: [
      "📈 Intensidade alta → jogo acelerado",
      "📉 Intensidade baixa → ritmo lento"
    ]
  }
};

function atualizarLegenda(labels) {
  const container = document.getElementById("legendaConteudo");
  container.innerHTML = "";

  labels.forEach(label => {
    const div = document.createElement("div");
    div.className = "legenda-item";

    div.innerHTML = `
      <strong>${label}</strong>
      ${legendaTexto[modoAtual][label][0]}<br>
      ${legendaTexto[modoAtual][label][1]}
    `;

    container.appendChild(div);
  });
}

/* ========= PRÉ-JOGO ========= */

function calcularPreJogo() {
  const A = {
    ataque: normalizar(ler("gmA") / ler("jogosA"), 0, 3),
    defesa: 100 - normalizar(ler("gsA") / ler("jogosA"), 0, 3),
    forma: normalizar(ler("pontosA"), 0, 15),
    eficiencia: normalizar(ler("gmA") / (ler("gmA") + ler("gsA") + 1), 0, 1),
    consistencia: normalizar(1 - ler("gsA") / (ler("gmA") + 1), 0, 1)
  };

  const B = {
    ataque: normalizar(ler("gmB") / ler("jogosB"), 0, 3),
    defesa: 100 - normalizar(ler("gsB") / ler("jogosB"), 0, 3),
    forma: normalizar(ler("pontosB"), 0, 15),
    eficiencia: normalizar(ler("gmB") / (ler("gmB") + ler("gsB") + 1), 0, 1),
    consistencia: normalizar(1 - ler("gsB") / (ler("gmB") + 1), 0, 1)
  };

  const labels = ["Ataque", "Defesa", "Forma", "Eficiência", "Consistência"];

  criarRadar(labels, Object.values(A), Object.values(B));
}

/* ========= HT ========= */

function calcularHT() {
  const A = {
    dominio: normalizar(ler("posseA") + ler("finalA") * 3, 20, 80),
    pressao: normalizar(ler("finalA") + ler("escA") * 2, 0, 20),
    perigo: normalizar(ler("finalA") * 0.7 + ler("golsA_ht") * 5, 0, 15),
    eficiencia: normalizar(ler("golsA_ht") / (ler("finalA") + 1), 0, 0.6),
    intensidade: normalizar(ler("finalA") + ler("escA") + ler("cartA") * 1.5, 0, 25)
  };

  const B = {
    dominio: normalizar(ler("posseB") + ler("finalB") * 3, 20, 80),
    pressao: normalizar(ler("finalB") + ler("escB") * 2, 0, 20),
    perigo: normalizar(ler("finalB") * 0.7 + ler("golsB_ht") * 5, 0, 15),
    eficiencia: normalizar(ler("golsB_ht") / (ler("finalB") + 1), 0, 0.6),
    intensidade: normalizar(ler("finalB") + ler("escB") + ler("cartB") * 1.5, 0, 25)
  };

  const labels = ["Domínio", "Pressão", "Perigo", "Eficiência", "Intensidade"];

  criarRadar(labels, Object.values(A), Object.values(B));
}

/* ========= RADAR ========= */

function criarRadar(labels, dadosA, dadosB) {
  const ctx = document.getElementById("radar");

  if (radarChart) radarChart.destroy();

  radarChart = new Chart(ctx, {
    type: "radar",
    data: {
      labels,
      datasets: [
        {
          label: "Time A",
          data: dadosA,
          backgroundColor: "rgba(0,119,204,0.2)",
          borderColor: "#0077cc",
          borderWidth: 2
        },
        {
          label: "Time B",
          data: dadosB,
          backgroundColor: "rgba(220,53,69,0.2)",
          borderColor: "#dc3545",
          borderWidth: 2
        }
      ]
    },
    options: {
      scales: {
        r: {
          min: 0,
          max: 100,
          ticks: { stepSize: 20 }
        }
      }
    }
  });

  atualizarLegenda(labels);
}
