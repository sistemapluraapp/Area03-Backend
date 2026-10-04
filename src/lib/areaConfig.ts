// Diferenças entre as Áreas 02 (B2B) e 03 (B2G) na gestão de páginas.
// Os demais arquivos de src/lib/pagina*.ts e src/routes/{paginas,midias,
// experiencias,opcoes}.ts são idênticos nas duas áreas.
export const AREA_CONFIG = {
  tipoPagina: 'publica',
  escopo: 'b2g',
  colunaCriador: 'criado_por_gov_conta',
  // Página da outra área: só é editada lá
  outraArea: { nome: 'Plura para empresas', url: 'https://login.plura.app.br' },
  // Contas Gov e usuários Plura colaboram em páginas Gov
  aceitaContaGov: true,
} as const
