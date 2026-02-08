let modoAtual = "PRE";
let radarChart = null;

const btnPre = document.getElementById("btn_pre");
const btnHT = document.getElementById("btn_ht");

const boxTimeA = document.getElementById("box_time_a");
const boxTimeB = document.getElementById("box_time_b");
const boxHT = document.getElementById("box_ht");

// estado inicial
boxHT.style.display = "none";

btnPre.onclick = () => trocarModo("PRE");
btnHT.onclick = () => trocarModo("HT");

function trocarModo(modo) {
  modoAtual = modo;

  btnPre.classList.toggle("ativo", modo === "PRE");
  btnHT.classList.toggle("ativo", modo === "HT");

  if (modo === "PRE") {
    boxTimeA.style.display = "block";
    boxTimeB.style.display = "block";
    boxHT.style.display = "none";
  } else {
    boxTimeA.style.display = "none";
    boxTimeB.style.display = "none";
    boxHT.style.display = "block";
  }
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

/* ================= PRÉ-JOGO ================= */

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

  criarRadar(
    ["Ataque", "Defesa", "Forma", "Eficiência", "Consistência"],
    Object.values(A),
    Object.values(B)
  );
}

/* ================= HT ================= */

function calcularHT() {
  const A = {
    dominio: normalizar(ler("posseA") + ler("finalA") * 3, 20, 80),
    pressao: normalizar(ler("finalA") + ler("escA") * 2, 0, 20),
    perigo: normalizar(ler("finalA") * 0.7 + ler("golsA_ht") * 5, 0, 15),
    eficiencia: normalizar(ler("golsA_ht") / (ler("finalA") + 1), 0, 0.6),
    intensidade: normalizar(
      ler("finalA") + ler("escA") + ler("cartA") * 1.5,
      0,
      25
    )
  };

  const B = {
    dominio: normalizar(ler("posseB") + ler("finalB") * 3, 20, 80),
    pressao: normalizar(ler("finalB") + ler("escB") * 2, 0, 20),
    perigo: normalizar(ler("finalB") * 0.7 + ler("golsB_ht") * 5, 0, 15),
    eficiencia: normalizar(ler("golsB_ht") / (ler("finalB") + 1), 0, 0.6),
    intensidade: normalizar(
      ler("finalB") + ler("escB") + ler("cartB") * 1.5,
      0,
      25
    )
  };

  criarRadar(
    ["Domínio", "Pressão", "Perigo", "Eficiência", "Intensidade"],
    Object.values(A),
    Object.values(B)
  );
}

/* ================= GRÁFICO ================= */

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
}
