// - localStorage para salvar dados por mês
// - pré-preenchimento de receitas e despesas

let mesAtual = "";

function abrirMes(mes) {
  mesAtual = mes;
  // Sincroniza seletor de moeda com o localStorage
  moedaAtual = localStorage.getItem("moeda") || "BRL";
  document.getElementById("seletorMoeda").value = moedaAtual;

  document.getElementById("paginaInicial").style.display = "none";
  document.getElementById("paginaMes").style.display = "block";
  document.getElementById("tituloMes").textContent = mes;

  carregarDadosDoMes();
  preencherPadroes();
  atualizarTotais();
}

function voltarInicio() {
  salvarDadosDoMes();
  document.getElementById("paginaInicial").style.display = "block";
  document.getElementById("paginaMes").style.display = "none";
  limparMes();
}

function adicionarLinha(tbodyId, descricao = "", valor = "") {
  const tbody = document.getElementById(tbodyId);
  const tr = document.createElement("tr");

  tr.innerHTML = `
    <td><textarea rows="2" style="width: 100%; resize: vertical;" placeholder="Descrição" oninput="atualizarTotais()">${descricao}</textarea></td>
    <td><input type="number" value="${valor}" oninput="atualizarTotais()"></td>
    <td><button onclick="removerLinha(this)">Remover</button></td>
  `;

  tbody.appendChild(tr);
}

function removerLinha(botao) {
  botao.parentElement.parentElement.remove();
  atualizarTotais();
}

function atualizarTotais() {
  const receitas = document.querySelectorAll(
    '#receitasBody input[type="number"]'
  );
  const despesas = document.querySelectorAll(
    '#despesasBody input[type="number"]'
  );

  let totalReceitas = 0;
  let totalDespesas = 0;

  receitas.forEach((input) => (totalReceitas += parseFloat(input.value) || 0));
  despesas.forEach((input) => (totalDespesas += parseFloat(input.value) || 0));

  const sobra = totalReceitas - totalDespesas;

  document.getElementById("totalReceitas").textContent =
    formatarComMoeda(totalReceitas);
  document.getElementById("totalDespesas").textContent =
    formatarComMoeda(totalDespesas);
  document.getElementById("sobra").textContent = formatarComMoeda(sobra);

  atualizarMeme(sobra);
  salvarDadosDoMes();
}

function atualizarMeme(sobra) {
  const meme = document.getElementById("memeImagem");
  if (sobra >= 1500) {
    meme.src = "img/muito-feliz.jpg";
  } else if (sobra >= 400) {
    meme.src = "img/feliz.png";
  } else if (sobra >= 50) {
    meme.src = "img/triste.jpg";
  } else {
    meme.src = "img/desesperado.png";
  }
}

function limparMes() {
  document.getElementById("receitasBody").innerHTML = "";
  document.getElementById("despesasBody").innerHTML = "";
  document.getElementById("totalReceitas").textContent = "0.00";
  document.getElementById("totalDespesas").textContent = "0.00";
  document.getElementById("sobra").textContent = "0.00";
  document.getElementById("memeImagem").src = "img/meme-feliz.png";
}

function preencherPadroes() {
  if (document.getElementById("receitasBody").children.length === 0) {
    const receitasPadrao = ["TRABALHO FIXO", "RENDA EXTRA 1", "RENDA EXTRA 2"];
    receitasPadrao.forEach((desc) => adicionarLinha("receitasBody", desc));
  }

  if (document.getElementById("despesasBody").children.length === 0) {
    const despesasPadrao = [
      "ALUGUEL",
      "LUZ",
      "ÁGUA",
      "INTERNET",
      "INTERNET CELULAR",
      "LAZER 1 (saídas, viagens, bebida, ifood, etc)",
      "LAZER 2 (saídas, viagens, bebida, ifood, etc)",
      "LAZER 3 (saídas, viagens, bebida, ifood, etc)",
      "LOCOMOÇÃO (carro, uber, transporte público)",
      "SAÚDE (plano de saúde, academia, remédios)",
      "SUPERMERCADO",
      "CARTÃO DE CRÉDITO",
    ];
    despesasPadrao.forEach((desc) => adicionarLinha("despesasBody", desc));
  }
}

function salvarDadosDoMes() {
  const dados = {
    receitas: [],
    despesas: [],
  };

  document.querySelectorAll("#receitasBody tr").forEach((tr) => {
    const descricao = tr.querySelector("textarea")?.value || "";
    const valor = tr.querySelector("input[type='number']")?.value || "";
    dados.receitas.push({ descricao, valor });
  });

  document.querySelectorAll("#despesasBody tr").forEach((tr) => {
    const descricao = tr.querySelector("textarea")?.value || "";
    const valor = tr.querySelector("input[type='number']")?.value || "";
    dados.despesas.push({ descricao, valor });
  });

  localStorage.setItem(`financeiro_${mesAtual}`, JSON.stringify(dados));
}

function carregarDadosDoMes() {
  limparMes();
  const dadosSalvos = localStorage.getItem(`financeiro_${mesAtual}`);
  if (dadosSalvos) {
    const dados = JSON.parse(dadosSalvos);
    dados.receitas.forEach((item) =>
      adicionarLinha("receitasBody", item.descricao, item.valor)
    );
    dados.despesas.forEach((item) =>
      adicionarLinha("despesasBody", item.descricao, item.valor)
    );
  }
}

let moedaAtual = localStorage.getItem("moeda") || "BRL";

function trocarMoeda() {
  const seletor = document.getElementById("seletorMoeda");
  moedaAtual = seletor.value;
  localStorage.setItem("moeda", moedaAtual);
  atualizarTotais();
}

function formatarMoeda(valor) {
  let locale = "pt-BR";

  switch (moedaAtual) {
    case "USD":
      locale = "en-US";
      break;
    case "EUR":
      locale = "de-DE";
      break;
    case "BRL":
      locale = "pt-BR";
      break;
  }

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: moedaAtual,
    minimumFractionDigits: 2,
  }).format(valor);
}

function formatarComMoeda(valor) {
  switch (moedaAtual) {
    case "USD":
      return `$${valor.toFixed(2)}`;
    case "EUR":
      return `€${valor.toFixed(2)}`;
    case "JPY":
      return `¥${valor.toFixed(2)}`;
    default:
      return `R$${valor.toFixed(2)}`;
  }
}

document.getElementById("btnVoltar").addEventListener("click", voltarInicio);
