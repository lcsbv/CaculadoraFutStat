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
  btnPre.setAttribute("aria-selected", modo === "PRE" ? "true" : "false");
  btnHT.setAttribute("aria-selected", modo === "HT" ? "true" : "false");
  boxTimeA.style.display = modo === "PRE" ? "block" : "none";
  boxTimeB.style.display = modo === "PRE" ? "block" : "none";
  boxHT.style.display = modo === "HT" ? "block" : "none";
  legendaConteudo.innerHTML = "";
}

btn_calcular.onclick = () => modoAtual === "PRE" ? calcularPre() : calcularHT();

function ler(id) {
  return Number(document.getElementById(id).value) || 0;
}

function normalizar(v, min, max) {
  return Math.max(0, Math.min(100, ((v - min) / (max - min)) * 100));
}

/* ===== LEGENDA ===== */
const legendaTexto = {
  PRE: {
    Defesa: ["Defesa forte → sofre pouco", "Defesa fraca → vulnerável"],
    Consistência: ["Consistente → padrão", "Inconstante → oscila"],
    Eficiência: ["Eficiente → converte", "Ineficiente → desperdiça"],
    Ataque: ["Ataque forte → cria chances", "Ataque fraco → pouca criação"],
    Forma: ["Forma alta → confiança", "Forma baixa → instável"]
  },
  HT: {
    Domínio: ["Domina o jogo", "Sofre imposição"],
    Pressão: ["Pressiona forte", "Pouca pressão"],
    Perigo: ["Cria chances reais", "Pouco perigo"],
    Eficiência: ["Finaliza bem", "Finaliza mal"],
    Intensidade: ["Ritmo alto", "Ritmo baixo"]
  }
};

/* ===== PRÉ ===== */
function calcularPre() {
  const labels = ["Defesa", "Consistência", "Eficiência", "Ataque", "Forma"];

  const gmA = ler("gmA");
  const gsA = ler("gsA");
  const jA = ler("jogosA");
  const atkA = normalizar(gmA / jA, 0, 3);
  const defA = 100 - normalizar(gsA / jA, 0, 3);
  const formaA = normalizar(ler("pontosA"), 0, 15);
  const eficA = normalizar(gmA / (gmA + gsA + 1), 0, 1);
  const consA = normalizar(1 - gsA / (gmA + 1), 0, 1);
  const A = [defA, consA, eficA, atkA, formaA];

  const gmB = ler("gmB");
  const gsB = ler("gsB");
  const jB = ler("jogosB");
  const atkB = normalizar(gmB / jB, 0, 3);
  const defB = 100 - normalizar(gsB / jB, 0, 3);
  const formaB = normalizar(ler("pontosB"), 0, 15);
  const eficB = normalizar(gmB / (gmB + gsB + 1), 0, 1);
  const consB = normalizar(1 - gsB / (gmB + 1), 0, 1);
  const B = [defB, consB, eficB, atkB, formaB];

  criarRadar(labels, A, B);
}

/* ===== HT ===== */
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

  criarRadar(labels, A, B);
}

function criarRadar(labels, A, B) {
  if (radarChart) radarChart.destroy();

  const fontFamily = "'DM Sans', system-ui, sans-serif";
  radarChart = new Chart(radar, {
    type: "radar",
    data: {
      labels,
      datasets: [
        {
          label: nomeA.value,
          data: A,
          backgroundColor: "rgba(37, 99, 235, 0.22)",
          borderColor: "#2563eb",
          borderWidth: 2,
          pointBackgroundColor: "#2563eb",
          pointBorderColor: "#fff",
          pointHoverBackgroundColor: "#fff",
          pointHoverBorderColor: "#2563eb"
        },
        {
          label: nomeB.value,
          data: B,
          backgroundColor: "rgba(225, 29, 72, 0.18)",
          borderColor: "#e11d48",
          borderWidth: 2,
          pointBackgroundColor: "#e11d48",
          pointBorderColor: "#fff",
          pointHoverBackgroundColor: "#fff",
          pointHoverBorderColor: "#e11d48"
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
            display: false
          },
          grid: { color: "rgba(100, 116, 139, 0.18)" },
          angleLines: { color: "rgba(100, 116, 139, 0.12)" },
          pointLabels: {
            font: { family: fontFamily, size: 12, weight: "600" },
            color: "#334155"
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
            color: "#0f172a"
          }
        }
      }
    }
  });

  gerarLegenda(labels);
}

function gerarLegenda(labels) {
  legendaConteudo.innerHTML = "";

  labels.forEach(l => {
    const [a, b] = legendaTexto[modoAtual][l];
    legendaConteudo.innerHTML += `
        <div class="legenda-item">
          <strong>${l}</strong>
          <span class="legenda-line">${a}</span>
          <span class="legenda-line">${b}</span>
        </div>
      `;
  });

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
