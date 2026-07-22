/**
 * Carga inicial de questões (roadmap 3.7) — matérias prioritárias:
 * Língua Portuguesa, Raciocínio Lógico e Legislação Institucional.
 *
 * Conteúdo gerado com assistência de IA. Itens baseados em regras
 * consolidadas da norma-padrão, lógica proposicional clássica e
 * texto expresso da CF/88. Recomenda-se revisão humana (o admin pode
 * despublicar/editar qualquer item em /admin/questoes).
 */

export type SeedQuestion = {
  subjectSlug: string;
  statement: string;
  correctAnswer: boolean; // true = CERTO, false = ERRADO
  explanation: string;
  difficulty: "FACIL" | "MEDIO" | "DIFICIL";
};

export const SEED_QUESTIONS: SeedQuestion[] = [
  // ============================================================
  // LÍNGUA PORTUGUESA (20)
  // ============================================================
  {
    subjectSlug: "lingua-portuguesa",
    statement:
      'Na frase "Vende-se casas no centro de São Luís", a concordância verbal está de acordo com a norma-padrão.',
    correctAnswer: false,
    explanation:
      'Trata-se de voz passiva sintética: "casas" é o sujeito, logo o verbo deve ir ao plural — "Vendem-se casas".',
    difficulty: "MEDIO",
  },
  {
    subjectSlug: "lingua-portuguesa",
    statement:
      'Em "Havia muitos candidatos na fila do concurso", o verbo "haver" está corretamente flexionado no singular.',
    correctAnswer: true,
    explanation:
      'O verbo "haver" no sentido de "existir" é impessoal e permanece na 3ª pessoa do singular.',
    difficulty: "MEDIO",
  },
  {
    subjectSlug: "lingua-portuguesa",
    statement: 'A frase "Fazem dez anos que ele ingressou na corporação" segue a norma-padrão.',
    correctAnswer: false,
    explanation:
      'O verbo "fazer" indicando tempo decorrido é impessoal: o correto é "Faz dez anos que ele ingressou".',
    difficulty: "MEDIO",
  },
  {
    subjectSlug: "lingua-portuguesa",
    statement:
      'O emprego da crase está correto em "Refiro-me à candidata aprovada em primeiro lugar".',
    correctAnswer: true,
    explanation:
      '"Referir-se" exige a preposição "a"; diante de palavra feminina determinada pelo artigo "a", ocorre a crase (a + a = à).',
    difficulty: "FACIL",
  },
  {
    subjectSlug: "lingua-portuguesa",
    statement:
      'Na oração "Choveu forte em Imperatriz durante a madrugada", o sujeito é indeterminado.',
    correctAnswer: false,
    explanation:
      "Verbos que indicam fenômenos da natureza formam oração SEM sujeito (sujeito inexistente), e não sujeito indeterminado.",
    difficulty: "MEDIO",
  },
  {
    subjectSlug: "lingua-portuguesa",
    statement:
      'No sentido de "ver, presenciar", o verbo "assistir" exige a preposição "a", como em "Assistimos ao desfile militar".',
    correctAnswer: true,
    explanation:
      'Assistir (= ver) é transitivo indireto: assiste-se A algo. Sem preposição, "assistir" significa "prestar assistência".',
    difficulty: "MEDIO",
  },
  {
    subjectSlug: "lingua-portuguesa",
    statement: 'As palavras "onde" e "aonde" podem ser usadas indiferentemente na norma-padrão.',
    correctAnswer: false,
    explanation:
      '"Onde" indica lugar em que se está (verbos sem movimento); "aonde" indica destino (verbos de movimento): "aonde você vai?".',
    difficulty: "FACIL",
  },
  {
    subjectSlug: "lingua-portuguesa",
    statement:
      'Em "Prefiro estudar a sair com os amigos", a regência do verbo "preferir" está correta.',
    correctAnswer: true,
    explanation:
      'Na norma-padrão, prefere-se uma coisa A outra — sem "do que" e sem reforços como "mil vezes".',
    difficulty: "MEDIO",
  },
  {
    subjectSlug: "lingua-portuguesa",
    statement: 'A palavra "rubrica" é proparoxítona, devendo ser pronunciada como "RÚbrica".',
    correctAnswer: false,
    explanation: 'A pronúncia correta é paroxítona: ru-BRI-ca. Não existe acento em "rubrica".',
    difficulty: "MEDIO",
  },
  {
    subjectSlug: "lingua-portuguesa",
    statement: 'Após o Acordo Ortográfico, a palavra "ideia" deixou de receber acento agudo.',
    correctAnswer: true,
    explanation:
      "O acordo eliminou o acento dos ditongos abertos 'ei' e 'oi' nas paroxítonas: ideia, assembleia, heroico.",
    difficulty: "FACIL",
  },
  {
    subjectSlug: "lingua-portuguesa",
    statement: 'É correta a construção "Menas pessoas compareceram ao concurso este ano".',
    correctAnswer: false,
    explanation: '"Menos" é palavra invariável; "menas" não existe na língua portuguesa.',
    difficulty: "FACIL",
  },
  {
    subjectSlug: "lingua-portuguesa",
    statement:
      'Em "Ele se esqueceu dos documentos", o verbo pronominal "esquecer-se" exige a preposição "de".',
    correctAnswer: true,
    explanation:
      'Na forma pronominal, o verbo exige preposição: esquecer-se DE algo. Sem pronome, dispensa: "esqueceu os documentos".',
    difficulty: "DIFICIL",
  },
  {
    subjectSlug: "lingua-portuguesa",
    statement:
      "A vírgula deve ser empregada para separar o sujeito do predicado em orações longas.",
    correctAnswer: false,
    explanation:
      "Nunca se separa sujeito de predicado por vírgula, independentemente do tamanho da oração.",
    difficulty: "FACIL",
  },
  {
    subjectSlug: "lingua-portuguesa",
    statement: 'O superlativo absoluto sintético de "fácil" é "facílimo".',
    correctAnswer: true,
    explanation:
      "Adjetivos terminados em -il átono formam superlativo em -ílimo: fácil → facílimo.",
    difficulty: "MEDIO",
  },
  {
    subjectSlug: "lingua-portuguesa",
    statement: 'O acento circunflexo em "pôde" (3ª pessoa do pretérito perfeito) é facultativo.',
    correctAnswer: false,
    explanation:
      'O acento é obrigatório: diferencia "pôde" (passado) de "pode" (presente) — acento diferencial mantido pelo Acordo.',
    difficulty: "MEDIO",
  },
  {
    subjectSlug: "lingua-portuguesa",
    statement:
      'Em "Os policiais chegaram à delegacia", o termo "à delegacia" é adjunto adverbial de lugar.',
    correctAnswer: true,
    explanation:
      "O termo indica o lugar para onde os policiais foram — circunstância de lugar, portanto adjunto adverbial.",
    difficulty: "MEDIO",
  },
  {
    subjectSlug: "lingua-portuguesa",
    statement:
      'A expressão "a nível de" é consagrada pela norma-padrão com o sentido de "em relação a".',
    correctAnswer: false,
    explanation:
      'Trata-se de modismo condenado pela norma-padrão. Usa-se "em nível de" (quando há níveis) ou reformula-se a frase.',
    difficulty: "MEDIO",
  },
  {
    subjectSlug: "lingua-portuguesa",
    statement: 'Em "Houve reunião entre eu e o comandante", o pronome está empregado corretamente.',
    correctAnswer: false,
    explanation: 'Após preposição, usa-se pronome oblíquo tônico: "entre mim e o comandante".',
    difficulty: "MEDIO",
  },
  {
    subjectSlug: "lingua-portuguesa",
    statement: 'O plural de "cidadão" é "cidadãos".',
    correctAnswer: true,
    explanation:
      'Palavras em -ão podem fazer plural em -ãos, -ães ou -ões; "cidadão" faz "cidadãos".',
    difficulty: "FACIL",
  },
  {
    subjectSlug: "lingua-portuguesa",
    statement:
      'Em "É proibido entrada de civis no quartel", a concordância está correta segundo a norma-padrão.',
    correctAnswer: true,
    explanation:
      'Sem artigo, a expressão fica invariável: "É proibido entrada". Com artigo, flexiona: "É proibida A entrada".',
    difficulty: "DIFICIL",
  },

  // ============================================================
  // RACIOCÍNIO LÓGICO (20)
  // ============================================================
  {
    subjectSlug: "raciocinio-logico",
    statement:
      "Se a proposição P é verdadeira e a proposição Q é falsa, então a condicional P → Q é falsa.",
    correctAnswer: true,
    explanation: "A condicional só é falsa no caso V → F. É exatamente essa a situação descrita.",
    difficulty: "FACIL",
  },
  {
    subjectSlug: "raciocinio-logico",
    statement: 'A negação de "Todos os soldados são pontuais" é "Nenhum soldado é pontual".',
    correctAnswer: false,
    explanation: 'A negação de "todos são" é "pelo menos um não é": "Algum soldado não é pontual".',
    difficulty: "MEDIO",
  },
  {
    subjectSlug: "raciocinio-logico",
    statement: "A disjunção inclusiva P ∨ Q é falsa somente quando P e Q são ambas falsas.",
    correctAnswer: true,
    explanation: 'O "ou" inclusivo só é falso quando as duas proposições são falsas.',
    difficulty: "FACIL",
  },
  {
    subjectSlug: "raciocinio-logico",
    statement:
      "Se a condicional P → Q é verdadeira, sua recíproca Q → P é necessariamente verdadeira.",
    correctAnswer: false,
    explanation:
      "Condicional e recíproca não são equivalentes: com P falsa e Q verdadeira, P → Q é V, mas Q → P é F.",
    difficulty: "MEDIO",
  },
  {
    subjectSlug: "raciocinio-logico",
    statement: "A contrapositiva de P → Q é ¬Q → ¬P, e ambas são logicamente equivalentes.",
    correctAnswer: true,
    explanation: "P → Q ≡ ¬Q → ¬P é uma das equivalências mais cobradas pelo Cebraspe.",
    difficulty: "MEDIO",
  },
  {
    subjectSlug: "raciocinio-logico",
    statement: "A negação da condicional P → Q é a proposição P ∧ ¬Q.",
    correctAnswer: true,
    explanation:
      "Negar a condicional é afirmar o antecedente e negar o consequente: ¬(P → Q) ≡ P ∧ ¬Q.",
    difficulty: "MEDIO",
  },
  {
    subjectSlug: "raciocinio-logico",
    statement:
      "Uma proposição composta que assume valor verdadeiro para qualquer combinação de valores lógicos de suas componentes é chamada de tautologia.",
    correctAnswer: true,
    explanation:
      "Definição de tautologia. Se for sempre falsa, é contradição; se variar, é contingência.",
    difficulty: "FACIL",
  },
  {
    subjectSlug: "raciocinio-logico",
    statement:
      "A bicondicional P ↔ Q é verdadeira quando P e Q possuem valores lógicos diferentes.",
    correctAnswer: false,
    explanation: "A bicondicional é verdadeira quando os valores são IGUAIS (V-V ou F-F).",
    difficulty: "FACIL",
  },
  {
    subjectSlug: "raciocinio-logico",
    statement:
      "Em um grupo de 13 pessoas, é correto afirmar que pelo menos duas fazem aniversário no mesmo mês.",
    correctAnswer: true,
    explanation:
      "Princípio da casa dos pombos: 13 pessoas para 12 meses garante ao menos um mês com duas ou mais.",
    difficulty: "MEDIO",
  },
  {
    subjectSlug: "raciocinio-logico",
    statement: "O número de anagramas da palavra AMOR é igual a 24.",
    correctAnswer: true,
    explanation: "4 letras distintas: 4! = 4 × 3 × 2 × 1 = 24 anagramas.",
    difficulty: "FACIL",
  },
  {
    subjectSlug: "raciocinio-logico",
    statement: "Se todos os A são B e todos os B são C, então todos os A são C.",
    correctAnswer: true,
    explanation: "Silogismo válido por transitividade da inclusão entre conjuntos.",
    difficulty: "FACIL",
  },
  {
    subjectSlug: "raciocinio-logico",
    statement: "A sequência 2, 4, 8, 16, 32, ... é uma progressão aritmética de razão 2.",
    correctAnswer: false,
    explanation:
      "Cada termo é o dobro do anterior — progressão GEOMÉTRICA de razão 2. Na PA, soma-se a razão.",
    difficulty: "FACIL",
  },
  {
    subjectSlug: "raciocinio-logico",
    statement: "Em uma progressão aritmética de primeiro termo 5 e razão 3, o décimo termo é 32.",
    correctAnswer: true,
    explanation: "a10 = a1 + 9r = 5 + 9 × 3 = 32.",
    difficulty: "MEDIO",
  },
  {
    subjectSlug: "raciocinio-logico",
    statement:
      "No lançamento de um dado comum de seis faces, a probabilidade de sair um número par é de 50%.",
    correctAnswer: true,
    explanation: "Casos favoráveis {2, 4, 6} = 3; total = 6; probabilidade = 3/6 = 1/2 = 50%.",
    difficulty: "FACIL",
  },
  {
    subjectSlug: "raciocinio-logico",
    statement:
      "No lançamento simultâneo de dois dados comuns, a probabilidade de a soma ser 12 é de 1/12.",
    correctAnswer: false,
    explanation: "Só o par (6,6) soma 12, entre 36 combinações possíveis: probabilidade = 1/36.",
    difficulty: "MEDIO",
  },
  {
    subjectSlug: "raciocinio-logico",
    statement: "O valor de 15% de 200 é 30.",
    correctAnswer: true,
    explanation: "15% de 200 = 0,15 × 200 = 30.",
    difficulty: "FACIL",
  },
  {
    subjectSlug: "raciocinio-logico",
    statement:
      "Se 6 operários constroem um muro em 10 dias, então 3 operários, no mesmo ritmo, constroem o mesmo muro em 5 dias.",
    correctAnswer: false,
    explanation:
      "Grandezas inversamente proporcionais: metade dos operários leva o DOBRO do tempo — 20 dias.",
    difficulty: "MEDIO",
  },
  {
    subjectSlug: "raciocinio-logico",
    statement: 'A negação de "Algum policial é maranhense" é "Nenhum policial é maranhense".',
    correctAnswer: true,
    explanation:
      'A negação do quantificador existencial "algum é" é o universal negativo "nenhum é".',
    difficulty: "MEDIO",
  },
  {
    subjectSlug: "raciocinio-logico",
    statement:
      "Duas proposições compostas são logicamente equivalentes quando possuem tabelas-verdade idênticas.",
    correctAnswer: true,
    explanation: "Definição de equivalência lógica: mesmos valores para todas as combinações.",
    difficulty: "FACIL",
  },
  {
    subjectSlug: "raciocinio-logico",
    statement:
      "A conjunção P ∧ Q é verdadeira quando pelo menos uma das proposições componentes é verdadeira.",
    correctAnswer: false,
    explanation: 'O "e" exige AMBAS verdadeiras. Verdadeira com pelo menos uma é a disjunção (∨).',
    difficulty: "FACIL",
  },

  // ============================================================
  // LEGISLAÇÃO INSTITUCIONAL (16)
  // ============================================================
  {
    subjectSlug: "legislacao-institucional",
    statement:
      "Segundo a Constituição Federal de 1988, a segurança pública é dever do Estado e direito e responsabilidade de todos.",
    correctAnswer: true,
    explanation: "Texto literal do caput do art. 144 da CF/88.",
    difficulty: "FACIL",
  },
  {
    subjectSlug: "legislacao-institucional",
    statement: "As polícias militares são consideradas forças auxiliares e reserva do Exército.",
    correctAnswer: true,
    explanation:
      "Art. 144, § 6º, da CF/88: PMs e Corpos de Bombeiros são forças auxiliares e reserva do Exército.",
    difficulty: "FACIL",
  },
  {
    subjectSlug: "legislacao-institucional",
    statement: "Às polícias militares cabem a polícia ostensiva e a preservação da ordem pública.",
    correctAnswer: true,
    explanation: "Art. 144, § 5º, da CF/88 — competência constitucional das PMs.",
    difficulty: "FACIL",
  },
  {
    subjectSlug: "legislacao-institucional",
    statement:
      "As polícias militares e as polícias civis subordinam-se aos Governadores dos Estados, do Distrito Federal e dos Territórios.",
    correctAnswer: true,
    explanation: "Art. 144, § 6º, da CF/88.",
    difficulty: "MEDIO",
  },
  {
    subjectSlug: "legislacao-institucional",
    statement:
      "No âmbito estadual, a apuração de infrações penais comuns, ressalvada a competência da União, é atribuição da Polícia Militar.",
    correctAnswer: false,
    explanation:
      "Funções de polícia judiciária e apuração de infrações penais cabem às polícias CIVIS (art. 144, § 4º). A PM faz o policiamento ostensivo.",
    difficulty: "MEDIO",
  },
  {
    subjectSlug: "legislacao-institucional",
    statement: "A Constituição Federal proíbe ao militar a sindicalização e a greve.",
    correctAnswer: true,
    explanation:
      "Art. 142, § 3º, IV, da CF/88, aplicável aos militares estaduais por força do art. 42, § 1º.",
    difficulty: "MEDIO",
  },
  {
    subjectSlug: "legislacao-institucional",
    statement:
      "Os membros das Polícias Militares e dos Corpos de Bombeiros Militares são denominados pela CF/88 militares dos Estados, do Distrito Federal e dos Territórios.",
    correctAnswer: true,
    explanation: "Art. 42, caput, da CF/88, com redação da EC 18/1998.",
    difficulty: "MEDIO",
  },
  {
    subjectSlug: "legislacao-institucional",
    statement: "A hierarquia e a disciplina são as bases da organização das polícias militares.",
    correctAnswer: true,
    explanation:
      "As instituições militares organizam-se com base na hierarquia e na disciplina (art. 42 c/c art. 142 da CF/88).",
    difficulty: "FACIL",
  },
  {
    subjectSlug: "legislacao-institucional",
    statement: "O militar em serviço ativo pode estar filiado a partido político.",
    correctAnswer: false,
    explanation:
      "Art. 142, § 3º, V, da CF/88: enquanto em serviço ativo, o militar não pode estar filiado a partidos políticos.",
    difficulty: "MEDIO",
  },
  {
    subjectSlug: "legislacao-institucional",
    statement:
      "O policiamento ostensivo das rodovias federais é competência da Polícia Rodoviária Federal.",
    correctAnswer: true,
    explanation: "Art. 144, § 2º, da CF/88.",
    difficulty: "FACIL",
  },
  {
    subjectSlug: "legislacao-institucional",
    statement:
      "Compete às guardas municipais a proteção de bens, serviços e instalações do Município, conforme dispuser a lei.",
    correctAnswer: true,
    explanation: "Art. 144, § 8º, da CF/88.",
    difficulty: "MEDIO",
  },
  {
    subjectSlug: "legislacao-institucional",
    statement:
      "As polícias penais, incluídas na Constituição pela EC 104/2019, integram o rol dos órgãos de segurança pública do art. 144.",
    correctAnswer: true,
    explanation:
      "A EC 104/2019 acrescentou as polícias penais federal, estaduais e distrital ao art. 144 da CF/88.",
    difficulty: "MEDIO",
  },
  {
    subjectSlug: "legislacao-institucional",
    statement:
      "A Polícia Federal integra o rol de órgãos de segurança pública previsto no art. 144 da CF/88.",
    correctAnswer: true,
    explanation:
      "O art. 144 lista: polícia federal, PRF, polícia ferroviária federal, polícias civis, PMs e bombeiros militares, e polícias penais.",
    difficulty: "FACIL",
  },
  {
    subjectSlug: "legislacao-institucional",
    statement:
      "Aos militares estaduais é assegurado o direito de greve, desde que exercido após comunicação prévia ao comando.",
    correctAnswer: false,
    explanation:
      "Não há exceção: a greve é vedada ao militar em qualquer hipótese (art. 142, § 3º, IV, c/c art. 42 da CF/88).",
    difficulty: "MEDIO",
  },
  {
    subjectSlug: "legislacao-institucional",
    statement:
      "O policiamento ostensivo e a preservação da ordem pública no território maranhense competem à Polícia Militar do Maranhão.",
    correctAnswer: true,
    explanation: "Decorre do art. 144, § 5º, da CF/88, exercido no Maranhão pela PMMA.",
    difficulty: "FACIL",
  },
  {
    subjectSlug: "legislacao-institucional",
    statement:
      "Segundo a CF/88, cabe à polícia ferroviária federal, órgão permanente, o patrulhamento ostensivo das ferrovias federais.",
    correctAnswer: true,
    explanation: "Art. 144, § 3º, da CF/88.",
    difficulty: "DIFICIL",
  },
];
