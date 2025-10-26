// ====== Funções Utilitárias ======
function lerValor(id) {
  const campo = document.getElementById(id);
  const val = campo.value.trim();
  const num = parseInt(val, 10);
  if (isNaN(num) || num < 0) {
    campo.style.borderColor = "red";
    return 0;
  } else {
    campo.style.borderColor = "#555";
    return num;
  }
}

// ====== Cálculo de Possíveis Placares ======
function calcularPossiveisPlacares() {
  const totalJogos = parseInt(document.getElementById("total_jogos").value, 10) || 1;

  // --- Time A ---
  const golsA_marcados = lerValor("golsA_marcados");
  const golsA_sofridos = lerValor("golsA_sofridos");
  const mediaA_marcados = golsA_marcados / totalJogos;
  const defesaA = golsA_sofridos / totalJogos;

  // --- Time B ---
  const golsB_marcados = lerValor("golsB_marcados");
  const golsB_sofridos = lerValor("golsB_sofridos");
  const mediaB_marcados = golsB_marcados / totalJogos;
  const defesaB = golsB_sofridos / totalJogos;

  // --- Médias ajustadas por ataque/defesa adversária ---
  const lambdaA = mediaA_marcados * (defesaB / Math.max(defesaB, 0.1));
  const lambdaB = mediaB_marcados * (defesaA / Math.max(defesaA, 0.1));

  // Arredondar para gerar placar central
  const centralA = Math.max(0, Math.round(lambdaA));
  const centralB = Math.max(0, Math.round(lambdaB));

  // Gerar 3 possíveis placares plausíveis
  const possiveis = [];
  possiveis.push(`${centralA}x${centralB}`);
  if (possiveis.length < 3) possiveis.push(`${Math.max(0, centralA + 1)}x${centralB}`);
  if (possiveis.length < 3) possiveis.push(`${centralA}x${Math.max(0, centralB + 1)}`);

// --- Exibir no Textbox ---
const resultado = document.getElementById("resultado_texto");
resultado.textContent = 
  "=== Média de Gols ===\n\n" +
  "Time A\n" +
  `Gols Marcados: ${mediaA_marcados.toFixed(2)}\n` +
  `Gols Sofridos: ${defesaA.toFixed(2)}\n\n` +
  "Time B\n" +
  `Gols Marcados: ${mediaB_marcados.toFixed(2)}\n` +
  `Gols Sofridos: ${defesaB.toFixed(2)}\n\n` +
  `Média total do jogo: ${(mediaA_marcados + mediaB_marcados).toFixed(2)} (Over/Under)\n\n` +
  "= Possíveis Resultados =\n" +
  possiveis.join("\n");
}

// ====== Eventos ======
document.getElementById("btn_calcular").addEventListener("click", calcularPossiveisPlacares);
