Documentação do Projeto: OS Manager
Este documento detalha o escopo, as funcionalidades e o guia de uso do sistema OS Manager, uma solução para gerenciamento de Ordens de Serviço de manutenção.

1. Escopo do Projeto
1.1. Introdução
O projeto OS Manager visa substituir processos manuais ou descentralizados de solicitação e acompanhamento de manutenções. A plataforma web centraliza a criação, o monitoramento e a finalização de Ordens de Serviço (OS), proporcionando transparência e eficiência para toda a equipe.

1.2. Objetivos
Centralizar a Comunicação: Criar um ponto único para todas as solicitações de manutenção, eliminando a necessidade de e-mails, planilhas ou chamados informais.

Melhorar o Rastreamento: Permitir que tanto o solicitante quanto a equipe de manutenção acompanhem o status de uma OS em tempo real.

Otimizar o Fluxo de Trabalho: Padronizar o ciclo de vida de uma OS, garantindo que todas as etapas, da ciência à finalização, sejam cumpridas.

Facilitar a Gestão: Fornecer aos administradores ferramentas para gerenciar usuários, equipamentos e locais que fazem parte do processo de manutenção.

1.3. Funcionalidades Detalhadas
A. Módulo de Ordens de Serviço (OS)
Criação de OS: Qualquer usuário autenticado pode criar uma nova OS, especificando o equipamento, local, tipo de manutenção (Corretiva ou Preventiva) e uma descrição do problema.

Ciclo de Vida da OS: A OS passa pelos seguintes status, com ações específicas para cada transição:

ABERTA: Status inicial após a criação.

CIENTE: Após um mecânico ou líder dar ciência do chamado.

EM EXECUÇÃO: Após o mecânico iniciar o trabalho na OS.

CONCLUÍDA / CANCELADA: Status finais definidos pelo mecânico ao finalizar a execução.

Visualização de Detalhes: Uma tela dedicada permite ver todas as informações de uma OS específica, incluindo quem deu ciência, quem executou e quando.

B. Painel de Controle (Dashboard)
Visualização Centralizada: Exibe todas as Ordens de Serviço em uma lista agrupada por data.

Status Visuais: Cada OS exibe seu status atual através de "pílulas" coloridas para fácil identificação.

Ações Rápidas: A coluna "Ações" apresenta botões intuitivos (com ícones) que permitem à equipe de manutenção avançar a OS no seu ciclo de vida diretamente do painel.

Filtros: Permite filtrar a lista de OS por status, local, tipo de manutenção, etc.

C. Controle de Acesso e Papéis
O sistema possui um controle de acesso baseado nos seguintes papéis:

MECANICO: Pode criar OS, dar ciência, iniciar e finalizar a execução das OS.

LIDER: Possui as mesmas permissões do MECANICO, com a capacidade adicional de gerenciar a equipe (a ser detalhado em versões futuras).

ADMIN: Tem controle total sobre o sistema, incluindo o gerenciamento de usuários, equipamentos e locais, além de todas as permissões dos outros papéis.

USUÁRIO PADRÃO: (Ex: Solicitante) Pode criar e visualizar suas próprias Ordens de Serviço.

D. Módulo Administrativo
Gerenciamento de Funcionários (CRUD - Criar, Ler, Atualizar, Deletar).

Gerenciamento de Equipamentos (CRUD).

Gerenciamento de Locais (CRUD).

1.4. Tecnologias
Frontend: React

Backend: Spring Boot (Java)

Banco de Dados: PostgreSQL

2. Manual do Usuário
Bem-vindo ao OS Manager! Este guia vai te ajudar a usar o sistema de forma rápida e fácil.

2.1. Primeiros Passos: Fazendo o Login
Para começar, acesse o endereço do sistema fornecido pela sua equipe e utilize o e-mail e a senha que foram cadastrados para você.

2.2. A Tela Principal: O Dashboard
Após o login, você verá o Painel de Ordens de Serviço (Dashboard). É aqui que toda a mágica acontece! A tela mostra os chamados mais recentes no topo, agrupados por data.

2.3. Como Criar um Chamado (Ordem de Serviço)
Precisa de ajuda com algum equipamento? É simples:

No topo da tela, clique em "Criar OS".

Preencha o formulário:

Tipo de Manutenção: Escolha entre Corretiva (para um problema que já aconteceu) ou Preventiva (para uma manutenção agendada).

Equipamento e Local: Selecione na lista onde está o problema.

Descrição: Conte para a equipe de manutenção o que está acontecendo.

Clique em "Salvar". Pronto! Seu chamado aparecerá no painel para todos com o status Aberta.

2.4. Guia do Time de Manutenção: O Ciclo de Vida de uma OS
Se você é Mecânico ou Líder, seu dia a dia será na coluna "Ações". Ela é inteligente e te mostra apenas o próximo passo possível para cada chamado.

Etapa 1: "Estou Ciente"
O que você vê: Uma OS com status Aberta. Na coluna "Ações", você verá um botão verde com um ícone de "check" (✅).

O que fazer: Clique no botão verde (✅).

O que acontece: O status da OS muda para Ciente. Isso avisa a todos que você viu o chamado e ele está na sua fila de trabalho.

Etapa 2: "Mãos à Obra!"
O que você vê: Uma OS com status Ciente. O botão de ação agora é azul claro com um ícone de "play" (▶️).

O que fazer: Quando for começar o trabalho físico, clique no botão azul claro (▶️).

O que acontece: O status da OS muda para Em Execução. Agora todos sabem que você está ativamente trabalhando naquele problema.

Etapa 3: "Serviço Feito: Finalizando o Chamado"
O que você vê: Uma OS com status Em Execução. O botão de ação agora é azul escuro com um ícone de ferramenta (🛠️).

O que fazer: Após terminar o serviço, clique no botão azul escuro (🛠️).

O que acontece: Uma janela (modal) aparecerá na tela para você preencher os detalhes finais.

Dentro da Janela:

Ação Realizada: Descreva o que você fez para consertar o problema.

Datas e Detalhes: Preencha as informações do serviço.

A Decisão Final: No final da janela, você terá dois botões:

CONCLUIR OS: Clique aqui se o problema foi resolvido com sucesso.

CANCELAR OS: Clique aqui se, por algum motivo, o serviço não pôde ser concluído.

Após clicar em um dos botões, a OS será finalizada e sairá da sua lista de pendências.

2.5. Glossário de Status (O que as cores significam?)
Cor da Pílula

Status

Significado

Próxima Ação

🟢 Verde

Aberta

Um novo chamado foi criado e aguarda um técnico.

Dar Ciência (✅)

🔵 Azul

Ciente

Um técnico já viu o chamado e vai trabalhar nele em breve.

Iniciar Execução (▶️)

🟡 Amarelo

Em Execução

Um técnico está trabalhando ativamente neste chamado agora.

Preencher e Finalizar (🛠️)

⚫ Cinza

Concluída

O serviço foi finalizado com sucesso.

Nenhuma (Arquivo)

🔴 Vermelho

Cancelada

O serviço não pôde ser concluído.

Nenhuma (Arquivo)