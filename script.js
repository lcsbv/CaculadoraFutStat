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

  // --- Lambda para placares ---
  const lambdaA = Math.max(0, mediaA_marcados * (1 - defensaB / (mediaB_marcados + defensaB + 0.1)));
  const lambdaB = Math.max(0, mediaB_marcados * (1 - defensaA / (mediaA_marcados + defensaA + 0.1)));

  // --- Geração de placares ---
  const candidatos = [];
  for (let a = Math.floor(lambdaA) - 1; a <= Math.ceil(lambdaA) + 1; a++) {
    for (let b = Math.floor(lambdaB) - 1; b <= Math.ceil(lambdaB) + 1; b++) {
      if (a < 0 || b < 0) continue;
      let resultadoProb = a > b ? probVitA / 100 : a < b ? probVitB / 100 : probEmp / 100;
      const score = resultadoProb * Math.exp(-Math.abs(a - lambdaA) - Math.abs(b - lambdaB));
      candidatos.push({ placar: `${a}x${b}`, score });
    }
  }

  candidatos.sort((x, y) => y.score - x.score);
  const top3 = candidatos.slice(0, 3).map(c => c.placar);

  // --- Exibição ---
  const resultado = document.getElementById("resultado_texto");
  resultado.innerHTML = "";

  function criarLinha(texto, tipo, valor) {
    const linha = document.createElement("div");
    linha.style.padding = "6px 10px";
    linha.style.marginBottom = "4px";
    linha.style.borderRadius = "5px";
    linha.style.fontWeight = "600";
    linha.style.color = "black"; // texto permanece preto

    // Fundo
    if (tipo === "vitoria") linha.style.backgroundColor = "lightgreen";
    if (tipo === "empate") linha.style.backgroundColor = "orange";

    // Emoji se for maior valor
    const emoji = valor === maxVal ? " 🏆" : "";
    linha.textContent = `${texto}: ${valor.toFixed(1)}%${emoji}`;

    resultado.appendChild(linha);
  }

  criarLinha("Time A → Vitória", "vitoria", probVitA);
  criarLinha("Empate", "empate", probEmp);
  criarLinha("Time B → Vitória", "vitoria", probVitB);

  // --- Separador ---
  const separador = document.createElement("div");
  separador.style.height = "10px";
  resultado.appendChild(separador);

  // --- Médias e tendência ---
  const medias = document.createElement("div");
  medias.style.textAlign = "center";

  const mediaTotalGols = mediaA_marcados + mediaB_marcados;
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
    `<b>Média total de gols da partida:</b> ${mediaTotalGols.toFixed(2)}<br>` +
    `<span style="color:${corTendencia}; font-weight:600;">${tendenciaMercado}</span><br><br>` +
    `<b>Top 3 resultados prováveis:</b><br>` +
    top3.join("<br>");

  resultado.appendChild(medias);
  resultado.scrollIntoView({ behavior: "smooth", block: "center" });
}

document.getElementById("btn_calcular").addEventListener("click", calcularPossiveisPlacares);
