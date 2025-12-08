function calcular() {
    const a_gm = Number(document.getElementById("a_gm").value);
    const a_gs = Number(document.getElementById("a_gs").value);
    const a_j = Number(document.getElementById("a_jogos").value);

    const b_gm = Number(document.getElementById("b_gm").value);
    const b_gs = Number(document.getElementById("b_gs").value);
    const b_j = Number(document.getElementById("b_jogos").value);

    if (a_j === 0 || b_j === 0) {
        alert("Os jogos não podem ser zero!");
        return;
    }

    const mediaA_marcados = (a_gm / a_j).toFixed(2);
    const mediaA_sofridos = (a_gs / a_j).toFixed(2);

    const mediaB_marcados = (b_gm / b_j).toFixed(2);
    const mediaB_sofridos = (b_gs / b_j).toFixed(2);

    const texto = 
`📊 MÉDIA DE GOLS

🔵 TIME A
• Média de gols marcados: ${mediaA_marcados}
• Média de gols sofridos: ${mediaA_sofridos}

🔴 TIME B
• Média de gols marcados: ${mediaB_marcados}
• Média de gols sofridos: ${mediaB_sofridos}
`;

    document.getElementById("resultado").textContent = texto;

    document.getElementById("downloadBtn").style.display = "block";
}

function baixarResultado() {
    const texto = document.getElementById("resultado").textContent;

    const blob = new Blob([texto], { type: "text/plain" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "resultado_medias.txt";
    a.click();

    URL.revokeObjectURL(url);
}
