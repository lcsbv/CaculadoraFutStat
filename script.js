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
    Ataque: ["Ataque forte → cria chances", "Ataque fraco → pouca criação"],
    Defesa: ["Defesa forte → sofre pouco", "Defesa fraca → vulnerável"],
    Forma: ["Forma alta → confiança", "Forma baixa → instável"],
    Eficiência: ["Eficiente → converte", "Ineficiente → desperdiça"],
    Consistência: ["Consistente → padrão", "Inconstante → oscila"]
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
  const labels = ["Ataque", "Defesa", "Forma", "Eficiência", "Consistência"];

  const A = [
    normalizar(ler("gmA") / ler("jogosA"), 0, 3),
    100 - normalizar(ler("gsA") / ler("jogosA"), 0, 3),
    normalizar(ler("pontosA"), 0, 15),
    normalizar(ler("gmA") / (ler("gmA") + ler("gsA") + 1), 0, 1),
    normalizar(1 - ler("gsA") / (ler("gmA") + 1), 0, 1)
  ];

  const B = [
    normalizar(ler("gmB") / ler("jogosB"), 0, 3),
    100 - normalizar(ler("gsB") / ler("jogosB"), 0, 3),
    normalizar(ler("pontosB"), 0, 15),
    normalizar(ler("gmB") / (ler("gmB") + ler("gsB") + 1), 0, 1),
    normalizar(1 - ler("gsB") / (ler("gmB") + 1), 0, 1)
  ];

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

  radarChart = new Chart(radar, {
    type: "radar",
    data: {
      labels,
      datasets: [
        { label: nomeA.value, data: A, backgroundColor: "rgba(0,119,204,.2)", borderColor: "#0077cc" },
        { label: nomeB.value, data: B, backgroundColor: "rgba(220,53,69,.2)", borderColor: "#dc3545" }
      ]
    },
    options: { scales: { r: { min: 0, max: 100 } } }
  });

  gerarLegenda(labels, A, B);
}

function gerarLegenda(labels, A, B) {
  legendaConteudo.innerHTML = "";

  labels
    .map((l, i) => ({ l, f: (A[i] + B[i]) / 2 }))
    .sort((a, b) => b.f - a.f)
    .forEach(item => {
      legendaConteudo.innerHTML += `
        <div class="legenda-item">
          <strong>${item.l}</strong><br>
          ${legendaTexto[modoAtual][item.l][0]}<br>
          ${legendaTexto[modoAtual][item.l][1]}
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
