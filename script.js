function ler(id) {
  const v = parseFloat(document.getElementById(id).value);
  return isNaN(v) || v < 0 ? 0 : v;
}

document.getElementById("btn_calcular").addEventListener("click", () => {
  const jogosA = ler("jogosA");
  const jogosB = ler("jogosB");
  const gmA = ler("golsA_marcados");
  const gsA = ler("golsA_sofridos");
  const gmB = ler("golsB_marcados");
  const gsB = ler("golsB_sofridos");

  const res = document.getElementById("resultado_texto");

  if (jogosA === 0 || jogosB === 0) {
    res.textContent = "⚠️ Preencha o total de jogos para ambos os times.";
    return;
  }

  const mediaA_marcados = gmA / jogosA;
  const mediaA_sofridos = gsA / jogosA;

  const mediaB_marcados = gmB / jogosB;
  const mediaB_sofridos = gsB / jogosB;

  // Criação de placares prováveis
  const candidatos = [];
  const maxGols = 5;

  for (let a = 0; a <= maxGols; a++) {
    for (let b = 0; b <= maxGols; b++) {
      const score =
        Math.exp(-Math.abs(a - mediaA_marcados)) *
        Math.exp(-Math.abs(b - mediaB_marcados));
      candidatos.push({ placar: `${a}x${b}`, score });
    }
  }

  candidatos.sort((a, b) => b.score - a.score);

  const top3 = candidatos.slice(0, 3).map(p => p.placar);

  res.innerHTML =
    `📊 <b>Médias do Time A</b>\n` +
    `Marcados: ${mediaA_marcados.toFixed(2)}\n` +
    `Sofridos: ${mediaA_sofridos.toFixed(2)}\n\n` +

    `📊 <b>Médias do Time B</b>\n` +
    `Marcados: ${mediaB_marcados.toFixed(2)}\n` +
    `Sofridos: ${mediaB_sofridos.toFixed(2)}\n\n` +

    `🔥 <b>Top 3 placares prováveis:</b>\n` +
    top3.join("\n");

  // Mostrar botão de download
  document.getElementById("btn_download").style.display = "block";
});

document.getElementById("btn_download").addEventListener("click", () => {
  const area = document.getElementById("resultado_texto");

  html2canvas(area, { backgroundColor: "#fff" }).then(canvas => {
    const link = document.createElement("a");
    link.download = "resultado.png";
    link.href = canvas.toDataURL();
    link.click();
  });
});
