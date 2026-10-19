# OPS-WORKSPACE-3 — consolidar skills de Payments
Data: 19/10/2026.
- [x] Comparar SKILL.md e arquivos acompanhantes das duas skills.
- [x] Preservar versões mais completas do Claude e suas referências/helpers.
- [x] Criar fonte versionada em .agents/skills/analise-boletim-bandeira e .agents/skills/bandeiras-intercambio.
- [x] Encurtar somente descriptions para o limite de 1024 caracteres.
- [x] Validar ambas com quick_validate.py atual: Skill is valid.
- [x] Testar helper: --help, exemplo aceito, campo obrigatório ausente rejeitado, rótulos rich text.
- [x] Distribuir arquivos de apoio para .agents e .codex globais; alinhar SKILL.md também no Claude.
- [x] Conferir cópias por SHA-256 e preservar backups/manifestos.
- [ ] Validar geração e renderização completa de planilha real no Excel em tarefa específica.

Fonte de partida: ~/.claude/skills, comparada com ~/.agents/skills. Não foram removidas funcionalidades existentes da base compartilhada.
O validator antigo da instalação local não entende corretamente description YAML multilinha; a validação final usou o helper atual do Skill Creator.
Backups: ~/.imperio/backups/skills-workspace3-20261019-194605 e skills-metadata-20261019-194707.
Nenhum manual normativo, dado de cliente ou credencial foi copiado para as skills.
