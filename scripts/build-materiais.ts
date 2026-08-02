/**
 * Gera os PDFs de estudo a partir dos fragmentos em docs/materiais/src/.
 *
 * Por que HTML e não uma lib de PDF: gerar PDF em Node exigiria Puppeteer
 * (~300 MB) numa app que vai para produção, por causa de um pipeline de
 * conteúdo que roda meia dúzia de vezes. O navegador já sabe imprimir bem
 * — o que faltava era CSS de impressão decente, que está aqui.
 *
 * Uso:
 *   npx tsx scripts/build-materiais.ts
 *   → abre docs/materiais/dist/*.html no Chrome
 *   → Ctrl+P → Destino "Salvar como PDF" → Margens "Padrão" → Salvar
 *
 * Marque "Gráficos de segundo plano" na impressão, senão os quadros de
 * destaque saem sem fundo.
 */
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const SRC = "docs/materiais/src";
const DIST = "docs/materiais/dist";

const RODAPE = "Simulador PM MA 2026 · pmma.barvoxdigital.com.br";

function template(titulo: string, subtitulo: string, corpo: string): string {
  return `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<title>${titulo}</title>
<style>
  @page { size: A4; margin: 18mm 16mm 16mm; }

  :root { --tinta: #16181d; --suave: #5b6270; --linha: #d8dce3; --marca: #1e4fd8; --alerta: #b42318; }

  * { box-sizing: border-box; }
  body {
    font-family: "Segoe UI", -apple-system, Roboto, Helvetica, Arial, sans-serif;
    color: var(--tinta); background: #fff;
    font-size: 10.7pt; line-height: 1.5;
    margin: 0 auto; max-width: 190mm; padding: 0 4mm;
  }

  header.capa { border-bottom: 3px solid var(--marca); padding-bottom: 10px; margin-bottom: 22px; }
  header.capa .eyebrow { font-size: 8.5pt; letter-spacing: .12em; text-transform: uppercase; color: var(--marca); font-weight: 700; }
  header.capa h1 { font-size: 21pt; line-height: 1.15; margin: 6px 0 4px; letter-spacing: -.01em; }
  header.capa p { margin: 0; color: var(--suave); font-size: 10pt; }

  h2 {
    font-size: 13.5pt; margin: 26px 0 10px; padding-bottom: 5px;
    border-bottom: 1px solid var(--linha); letter-spacing: -.01em;
    break-after: avoid; page-break-after: avoid;
  }
  h3 { font-size: 11.4pt; margin: 18px 0 6px; break-after: avoid; page-break-after: avoid; }
  p { margin: 0 0 9px; }
  ul, ol { margin: 0 0 10px; padding-left: 20px; }
  li { margin-bottom: 4px; }
  strong { font-weight: 700; }
  code { font-family: Consolas, monospace; font-size: 9.6pt; background: #f1f3f7; padding: 1px 4px; border-radius: 3px; }

  table { width: 100%; border-collapse: collapse; margin: 0 0 14px; font-size: 9.8pt; break-inside: avoid; page-break-inside: avoid; }
  caption { text-align: left; font-weight: 700; padding-bottom: 5px; font-size: 10.2pt; }
  th, td { border: 1px solid var(--linha); padding: 5px 8px; text-align: left; vertical-align: top; }
  th { background: #eef1f6; font-weight: 700; }
  tbody tr:nth-child(even) td { background: #fafbfd; }

  .box { border-left: 3px solid var(--marca); background: #f4f7fe; padding: 9px 12px; margin: 0 0 13px; break-inside: avoid; page-break-inside: avoid; }
  .box.perigo { border-left-color: var(--alerta); background: #fef4f3; }
  .box .rotulo { font-size: 8.2pt; letter-spacing: .1em; text-transform: uppercase; font-weight: 700; color: var(--marca); display: block; margin-bottom: 3px; }
  .box.perigo .rotulo { color: var(--alerta); }
  .box p:last-child { margin-bottom: 0; }

  .art { color: var(--suave); font-size: 9.2pt; font-weight: 600; white-space: nowrap; }
  .certo { color: #0a7d3f; font-weight: 700; }
  .errado { color: var(--alerta); font-weight: 700; }

  footer.rodape { margin-top: 26px; padding-top: 9px; border-top: 1px solid var(--linha); color: var(--suave); font-size: 8.6pt; display: flex; justify-content: space-between; }

  section { break-inside: auto; }
  .quebra { break-before: page; page-break-before: page; }

  @media print { a { color: inherit; text-decoration: none; } }
</style>
</head>
<body>
<header class="capa">
  <div class="eyebrow">Simulador PM MA 2026</div>
  <h1>${titulo}</h1>
  <p>${subtitulo}</p>
</header>
${corpo}
<footer class="rodape"><span>${RODAPE}</span><span>Concurso PM MA · prova em 11/10/2026</span></footer>
</body>
</html>`;
}

function main() {
  mkdirSync(DIST, { recursive: true });
  const arquivos = readdirSync(SRC).filter((f) => f.endsWith(".html")).sort();
  if (!arquivos.length) {
    console.log(`Nenhum fragmento em ${SRC}/`);
    return;
  }

  for (const arquivo of arquivos) {
    const bruto = readFileSync(join(SRC, arquivo), "utf8");

    // Cabeçalho de metadados: as duas primeiras linhas são título e subtítulo.
    const linhas = bruto.split("\n");
    const titulo = (linhas[0] ?? "").replace(/^<!--\s*titulo:\s*/, "").replace(/\s*-->$/, "").trim();
    const subtitulo = (linhas[1] ?? "").replace(/^<!--\s*subtitulo:\s*/, "").replace(/\s*-->$/, "").trim();
    const corpo = linhas.slice(2).join("\n").trim();

    if (!titulo || !subtitulo) {
      console.log(`✘ ${arquivo}: faltam as linhas de titulo/subtitulo no topo`);
      continue;
    }

    const saida = join(DIST, arquivo);
    writeFileSync(saida, template(titulo, subtitulo, corpo), "utf8");
    const kb = (Buffer.byteLength(corpo, "utf8") / 1024).toFixed(0);
    console.log(`✔ ${saida}  (${kb} KB de conteúdo)`);
  }

  console.log(`\n${arquivos.length} material(is) gerado(s) em ${DIST}/`);
  console.log("Abra no Chrome → Ctrl+P → Salvar como PDF → marque 'Gráficos de segundo plano'.");
}

main();
