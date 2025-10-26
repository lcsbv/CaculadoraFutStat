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

  // Validação básica
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
  const probVitA = ((vitoriasA / totalJogos) * 100).toFixed(1);
  const probEmpA = ((empatesA / totalJogos) * 100).toFixed(1);
  const probVitB = ((vitoriasB / totalJogos) * 100).toFixed(1);
  const probEmpB = ((empatesB / totalJogos) * 100).toFixed(1);

  // --- Identificar máximos ---
  const maxVit = Math.max(probVitA, probVitB);
  const maxEmp = Math.max(probEmpA, probEmpB);

  // --- Resultado provável ---
  const lambdaA = mediaA_marcados * (1 - (defensaB / (mediaB_marcados + defensaB + 0.1)));
  const lambdaB = mediaB_marcados * (1 - (defensaA / (mediaA_marcados + defensaA + 0.1)));
  const centralA = Math.max(0, Math.round(lambdaA));
  const centralB = Math.max(0, Math.round(lambdaB));

  const possiveis = [
    `${centralA}x${centralB}`,
    `${Math.max(0, centralA - 1)}x${centralB}`,
    `${centralA}x${Math.max(0, centralB - 1)}`,
    `${centralA + 1}x${centralB}`,
    `${centralA}x${centralB + 1}`
  ];

  // --- Exibir resultados ---
  const resultado = document.getElementById("resultado_texto");
  resultado.innerHTML = ""; // limpar conteúdo anterior

  function criarLinha(texto, tipo, valor) {
    const linha = document.createElement("div");
    linha.style.padding = "4px 8px";
    linha.style.borderRadius = "4px";
    linha.style.marginBottom = "2px";

    if (tipo === "vitoria" && parseFloat(valor) === parseFloat(maxVit)) {
      linha.style.backgroundColor = "lightgreen";
      linha.style.fontWeight = "600";
    }
    if (tipo === "empate" && parseFloat(valor) === parseFloat(maxEmp)) {
      linha.style.backgroundColor = "orange";
      linha.style.fontWeight = "600";
    }

    linha.innerHTML = texto;
    resultado.appendChild(linha);
  }

  // Probabilidades com destaque por linha
  criarLinha(`Time A → Vitória: ${probVitA}%`, "vitoria", probVitA);
  criarLinha(`Time A → Empate: ${probEmpA}%`, "empate", probEmpA);
  criarLinha(`Time B → Vitória: ${probVitB}%`, "vitoria", probVitB);
  criarLinha(`Time B → Empate: ${probEmpB}%`, "empate", probEmpB);

  // --- Linha em branco para separar as médias ---
  const separadorMedias = document.createElement("div");
  separadorMedias.style.height = "10px";
  separadorMedias.style.backgroundColor = "#ffffff";
  resultado.appendChild(separadorMedias);

  // Médias e possíveis resultados (sem destaque)
  const medias = document.createElement("div");
  medias.style.textAlign = "center";
  medias.innerHTML =
    `Time A → Marcados: ${mediaA_marcados.toFixed(2)}<br>` +
    `Time A → Sofridos: ${defensaA.toFixed(2)}<br>` +
    `Time B → Marcados: ${mediaB_marcados.toFixed(2)}<br>` +
    `Time B → Sofridos: ${defensaB.toFixed(2)}<br><br>` +
    `Média total do jogo: ${(mediaA_marcados + mediaB_marcados).toFixed(2)}<br><br>` +
    "== Possíveis Resultados ==<br>" +
    possiveis.join("<br>");
  resultado.appendChild(medias);

  // Rolagem suave
  resultado.scrollIntoView({ behavior: "smooth", block: "center" });
}

document.getElementById("btn_calcular").addEventListener("click", calcularPossiveisPlacares);
