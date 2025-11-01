function lerValor(id) {
  const campo = document.getElementById(id);
  const val = (campo && campo.value) ? campo.value.trim() : "";
  const num = parseInt(val, 10);
  if (isNaN(num) || num < 0) {
    if (campo) campo.style.borderColor = "red";
    return 0;
  } else {
    if (campo) campo.style.borderColor = "#555";
    return num;
  }
}

function calcularPossiveisPlacares() {
  const totalJogos = parseInt(document.getElementById("total_jogos").value, 10) || 1;

  // --- Time A ---
  const golsA_marcados = lerValor("golsA_marcados");
  const golsA_sofridos = lerValor("golsA_sofridos");
  const vitoriasA = lerValor("vitoriasA");
  const empatesA = lerValor("empatesA");

  // --- Time B ---
  const golsB_marcados = lerValor("golsB_marcados");
  const golsB_sofridos = lerValor("golsB_sofridos");
  const vitoriasB = lerValor("vitoriasB");
  const empatesB = lerValor("empatesB");

  // --- Validação ---
  if (vitoriasA + empatesA > totalJogos) {
    alert("Time A: vitórias + empates > total de jogos. Corrija os valores.");
    return;
  }
  if (vitoriasB + empatesB > totalJogos) {
    alert("Time B: vitórias + empates > total de jogos. Corrija os valores.");
    return;
  }

  // --- Probabilidades normalizadas ---
  const probVitA_raw = vitoriasA / totalJogos;
  const probEmp_raw = (empatesA + empatesB) / (2 * totalJogos);
  const probVitB_raw = vitoriasB / totalJogos;

  const totalProb = probVitA_raw + probEmp_raw + probVitB_raw;
  const probVitA = (probVitA_raw / totalProb) * 100;
  const probEmp = (probEmp_raw / totalProb) * 100;
  const probVitB = (probVitB_raw / totalProb) * 100;

  const maxVal = Math.max(probVitA, probEmp, probVitB);

  // --- Médias ---
  const mediaA_marcados = golsA_marcados / totalJogos;
  const defensaA = golsA_sofridos / totalJogos;
  const mediaB_marcados = golsB_marcados / totalJogos;
  const defensaB = golsB_sofridos / totalJogos;

  // --- Média total de gols ---
  const mediaTotalGols = (
    mediaA_marcados + defensaA + mediaB_marcados + defensaB
  ) / 2;

  const resultado = document.getElementById("resultado_texto");
  resultado.innerHTML = "";

  // --- Interrompe se não há base estatística ---
  if ((mediaA_marcados === 0 && mediaB_marcados === 0) ||
      (isNaN(mediaA_marcados) || isNaN(mediaB_marcados))) {
    resultado.innerHTML = "<b>⚠️ Dados insuficientes para estimar placares prováveis.</b>";
    return;
  }

  // --- Geração de placares com base nas médias ---
  const candidatos = [];
  const maxGols = Math.max(Math.ceil(mediaA_marcados), Math.ceil(mediaB_marcados)) + 2;

  for (let a = 0; a <= maxGols; a++) {
    for (let b = 0; b <= maxGols; b++) {
      const distancia = Math.abs(a - mediaA_marcados) + Math.abs(b - mediaB_marcados);
      const score = Math.exp(-distancia) * (
        a > b ? probVitA / 100 :
        a < b ? probVitB / 100 :
        probEmp / 100
      );
      candidatos.push({ placar: `${a}x${b}`, score });
    }
  }

  candidatos.sort((x, y) => y.score - x.score);
  const top3 = candidatos.slice(0, 3).map(c => c.placar);

  // --- Exibição ---
  function criarLinha(texto, tipo, valor) {
    const linha = document.createElement("div");
    linha.style.padding = "6px 10px";
    linha.style.marginBottom = "4px";
    linha.style.borderRadius = "5px";
    linha.style.fontWeight = "600";
    linha.style.color = "black";

    if (tipo === "vitoria") linha.style.backgroundColor = "lightgreen";
    if (tipo === "empate") linha.style.backgroundColor = "orange";

    const emoji = valor === maxVal ? " 🏆" : "";
    linha.textContent = `${texto}: ${valor.toFixed(1)}%${emoji}`;
    resultado.appendChild(linha);
  }

  criarLinha("Time A → Vitória", "vitoria", probVitA);
  criarLinha("Empate", "empate", probEmp);
  criarLinha("Time B → Vitória", "vitoria", probVitB);

  const separador = document.createElement("div");
  separador.style.height = "10px";
  resultado.appendChild(separador);

  const medias = document.createElement("div");
  medias.style.textAlign = "center";

  // --- Tendência do mercado ---
  let tendenciaMercado = "";
  let corTendencia = "";
  if (mediaTotalGols < 1.5) {
    tendenciaMercado = "Tendência: Under 1.5 gols";
    corTendencia = "red";
  } else if (mediaTotalGols < 2.5) {
    tendenciaMercado = "Tendência: Under 2.5 gols";
    corTendencia = "darkorange";
  } else if (mediaTotalGols < 3.5) {
    tendenciaMercado = "Tendência: Over 2.5 gols";
    corTendencia = "green";
  } else {
    tendenciaMercado = "Tendência: Over 3.5 gols";
    corTendencia = "darkgreen";
  }

  medias.innerHTML =
    `Time A → Marcados: ${mediaA_marcados.toFixed(2)}<br>` +
    `Time A → Sofridos: ${defensaA.toFixed(2)}<br><br>` +
    `Time B → Marcados: ${mediaB_marcados.toFixed(2)}<br>` +
    `Time B → Sofridos: ${defensaB.toFixed(2)}<br><br>` +
    `<b>Média total de gols (ajustada):</b> ${mediaTotalGols.toFixed(2)}<br>` +
    `<span style="color:${corTendencia}; font-weight:600;">${tendenciaMercado}</span><br><br>` +
    `<b>Top 3 resultados prováveis:</b><br>` +
    top3.join("<br>");

  resultado.appendChild(medias);
  resultado.scrollIntoView({ behavior: "smooth", block: "center" });
}

// --- Ações de clique ---
document.getElementById("btn_calcular").addEventListener("click", calcularPossiveisPlacares);

// --- Download do resultado como imagem ---
document.getElementById("btn_download").addEventListener("click", () => {
  const resultado = document.getElementById("resultado_texto");
  html2canvas(resultado, { backgroundColor: "#fff" }).then(canvas => {
    const link = document.createElement("a");
    const data = new Date().toISOString().split("T")[0];
    link.download = `resultado_${data}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  });
});
