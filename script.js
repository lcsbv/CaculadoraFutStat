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

  // --- Probabilidades (Vitória e Empate apenas) ---
  const probVitA = ((vitoriasA / totalJogos) * 100).toFixed(1);
  const probEmpA = ((empatesA / totalJogos) * 100).toFixed(1);
  const probVitB = ((vitoriasB / totalJogos) * 100).toFixed(1);
  const probEmpB = ((empatesB / totalJogos) * 100).toFixed(1);

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

  // --- Exibir ---
  const resultado = document.getElementById("resultado_texto");
  resultado.innerHTML =
    "=== Probabilidades ===\n\n" +
    `Time A → Vitória: ${probVitA}%\n` +
    `Time A → Empate: ${probEmpA}%\n\n` +
    `Time B → Vitória: ${probVitB}%\n` +
    `Time B → Empate: ${probEmpB}%\n\n` +
    "=== Média de Gols ===\n\n" +
    `Time A → Marcados: ${mediaA_marcados.toFixed(2)}\n` +
    `Time A → Sofridos: ${defensaA.toFixed(2)}\n\n` +
    `Time B → Marcados: ${mediaB_marcados.toFixed(2)}\n` +
    `Time B → Sofridos: ${defensaB.toFixed(2)}\n\n` +
    `Média total do jogo: ${(mediaA_marcados + mediaB_marcados).toFixed(2)}\n\n` +
    "= Possíveis Resultados =\n" +
    possiveis.join("\n");

  // --- Rolar automaticamente para o resultado ---
  resultado.scrollIntoView({
    behavior: "smooth", // rolagem suave
    block: "center"     // centraliza o elemento na tela
  });
}

document.getElementById("btn_calcular").addEventListener("click", calcularPossiveisPlacares);
