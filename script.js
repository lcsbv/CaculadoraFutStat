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

  // --- Validação básica ---
  if (vitoriasA + empatesA > totalJogos) {
    alert("Time A: vitórias + empates > total de jogos. Corrija os valores.");
    return;
  }
  if (vitoriasB + empatesB > totalJogos) {
    alert("Time B: vitórias + empates > total de jogos. Corrija os valores.");
    return;
  }

  // --- Médias de gols ---
  const mediaA_marcados = golsA_marcados / totalJogos;
  const defensaA = golsA_sofridos / totalJogos;
  const mediaB_marcados = golsB_marcados / totalJogos;
  const defensaB = golsB_sofridos / totalJogos;

  // --- Probabilidades ---
  const probVitA = (vitoriasA / totalJogos) * 100;
  const probEmpA = (empatesA / totalJogos) * 100;
  const probVitB = (vitoriasB / totalJogos) * 100;
  const probEmpB = (empatesB / totalJogos) * 100;

  const maxVit = Math.max(probVitA, probVitB);
  const maxEmp = Math.max(probEmpA, probEmpB);

  // --- Estimativa de gols ajustada (para gerar placares) ---
  const lambdaA = Math.max(0, mediaA_marcados * (1 - defensaB / (mediaB_marcados + defensaB + 0.1)));
  const lambdaB = Math.max(0, mediaB_marcados * (1 - defensaA / (mediaA_marcados + defensaA + 0.1)));

  // --- Geração de placares possíveis próximos da média ---
  const candidatos = [];
  for (let a = Math.floor(lambdaA) - 1; a <= Math.ceil(lambdaA) + 1; a++) {
    for (let b = Math.floor(lambdaB) - 1; b <= Math.ceil(lambdaB) + 1; b++) {
      if (a < 0 || b < 0) continue;
      let resultadoProb;
      if (a > b) resultadoProb = probVitA / 100;
      else if (a < b) resultadoProb = probVitB / 100;
      else resultadoProb = probEmpA / 100; // empate

      // Score = probabilidade x proximidade da média
      const score = resultadoProb * Math.exp(-Math.abs(a - lambdaA) - Math.abs(b - lambdaB));
      candidatos.push({ placar: `${a}x${b}`, score });
    }
  }

  // --- Ordenar e pegar os 3 melhores ---
  candidatos.sort((x, y) => y.score - x.score);
  const top3 = candidatos.slice(0, 3).map(c => c.placar);

  // --- Exibir resultados ---
  const resultado = document.getElementById("resultado_texto");
  resultado.innerHTML = ""; // limpar conteúdo anterior

  // Função auxiliar para criar linhas
  function criarLinha(texto, tipo, valor) {
    const linha = document.createElement("div");
    linha.style.padding = "4px 8px";
    linha.style.borderRadius = "4px";
    linha.style.marginBottom = "2px";

    if (tipo === "vitoria" && valor === maxVit) {
      linha.style.backgroundColor = "lightgreen";
      linha.style.fontWeight = "600";
    }
    if (tipo === "empate" && valor === maxEmp) {
      linha.style.backgroundColor = "orange";
      linha.style.fontWeight = "600";
    }

    linha.innerHTML = texto;
    resultado.appendChild(linha);
  }

  criarLinha(`Time A → Vitória: ${probVitA.toFixed(1)}%`, "vitoria", probVitA);
  criarLinha(`Time A → Empate: ${probEmpA.toFixed(1)}%`, "empate", probEmpA);
  criarLinha(`Time B → Vitória: ${probVitB.toFixed(1)}%`, "vitoria", probVitB);
  criarLinha(`Time B → Empate: ${probEmpB.toFixed(1)}%`, "empate", probEmpB);

  // --- Separador visual ---
  const separador = document.createElement("div");
  separador.style.height = "10px";
  separador.style.backgroundColor = "#ffffff";
  resultado.appendChild(separador);

  // --- Médias e top 3 resultados (com média real e tendência Under/Over) ---
  const medias = document.createElement("div");
  medias.style.textAlign = "center";

  // ✅ cálculo correto da média real de gols da partida
  const mediaTotalGols = mediaA_marcados + mediaB_marcados;

  // 🧠 determinar tendência de mercado (Under/Over)
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
    `<b>Média total de gols da partida (real):</b> ${mediaTotalGols.toFixed(2)}<br>` +
    `<span style="color:${corTendencia}; font-weight:600;">${tendenciaMercado}</span><br><br>` +
    "<b>Top 3 resultados prováveis:</b><br>" +
    top3.join("<br>");

  resultado.appendChild(medias);
  resultado.scrollIntoView({ behavior: "smooth", block: "center" });
}

// --- Evento principal ---
document.getElementById("btn_calcular").addEventListener("click", calcularPossiveisPlacares);
