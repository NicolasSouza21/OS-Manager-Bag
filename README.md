# OS Manager - Sistema de Gerenciamento de Ordens de Serviço

## 1. Visão Geral do Projeto

O **OS Manager** é uma solução web completa projetada para modernizar e otimizar o gerenciamento de Ordens de Serviço (OS) de manutenção. O sistema substitui processos manuais, como planilhas e comunicações informais, por uma plataforma centralizada, transparente e eficiente.

O objetivo principal é oferecer um fluxo de trabalho claro e rastreável para todas as solicitações de manutenção, desde a abertura do chamado até sua finalização e validação, melhorando a comunicação entre solicitantes e equipes técnicas.

### Principais Objetivos:
* **Centralizar Solicitações:** Criar um canal único para a abertura e o acompanhamento de todas as OS.
* **Rastreabilidade em Tempo Real:** Permitir que todos os envolvidos visualizem o status atual de qualquer OS.
* **Fluxo de Trabalho Padrão:** Garantir que cada OS siga um ciclo de vida predefinido, assegurando que nenhuma etapa seja esquecida.
* **Gestão Simplificada:** Fornecer aos administradores ferramentas para gerenciar usuários, equipamentos e locais de forma intuitiva.

---

## 2. Tecnologias Utilizadas

O projeto é construído com tecnologias modernas e robustas, dividido em duas partes principais:

### Backend (API)
* **Framework:** **Spring Boot**
* **Linguagem:** **Java 17**
* **Segurança:** **Spring Security** com autenticação baseada em **JWT (JSON Web Tokens)**.
* **Acesso a Dados:** **Spring Data JPA (Hibernate)**.
* **Banco de Dados:** **PostgreSQL**.
* **Build Tool:** **Maven**.

### Frontend (Aplicação Web)
* **Framework:** **React 19**
* **Build Tool:** **Vite**
* **Roteamento:** **React Router DOM**
* **Requisições HTTP:** **Axios**, com interceptors para injeção automática do token JWT.
* **Estilização:** CSS puro com arquitetura modular por componente.

---

## 3. Funcionalidades Detalhadas

### Módulo de Ordens de Serviço
* **Criação de OS:** Usuários autenticados podem criar OS do tipo **Corretiva** ou **Preventiva**, associando-as a um equipamento e local específicos.
* **Dashboard Interativo:** Uma tela principal que exibe todas as OS, agrupadas por data (`Hoje`, `Ontem`, etc.), com o status de cada uma destacado visualmente.
* **Ações Rápidas:** A equipe de manutenção pode interagir diretamente com as OS pelo dashboard, avançando-as no fluxo de trabalho com botões intuitivos de "Dar Ciência", "Iniciar Execução" e "Finalizar".
* **Visualização Completa:** Uma página de detalhes para cada OS, exibindo todas as informações, desde o solicitante até os responsáveis pela ciência e execução, incluindo datas e horários de cada etapa.
* **Registro de Execução:** Ao finalizar uma OS, o técnico preenche um formulário detalhado com a ação realizada, tempo de início e término, e peças substituídas, se houver.

### Módulo Administrativo
O sistema conta com uma área de administração (`/admin`) para gerenciar os dados mestres da aplicação:
* **Gerenciamento de Funcionários:** CRUD completo para usuários do sistema, incluindo a atribuição de cargos (perfis de permissão).
* **Gerenciamento de Equipamentos:** CRUD para cadastrar os equipamentos que podem receber manutenção.
* **Gerenciamento de Locais:** CRUD para os locais onde os equipamentos estão instalados.

### Controle de Acesso e Perfis
O acesso às funcionalidades é controlado por perfis de usuário, definidos através do enum `TipoFuncionario` e aplicados usando Spring Security:
* **ADMIN:** Acesso total ao sistema, incluindo todas as funcionalidades de gerenciamento.
* **LIDER:** Permissões para gerenciar OS e equipes.
* **MECANICO:** Pode criar, dar ciência, iniciar e finalizar a execução de OS.
* **ANALISTA_CQ:** Perfil destinado à verificação de qualidade (funcionalidade futura).

---

## 4. Guia de Uso: O Ciclo de Vida de uma OS

O fluxo de uma Ordem de Serviço é o coração do sistema. Ele foi desenhado para ser simples e intuitivo para a equipe de manutenção.

| Status           | Cor no Dashboard | Significado                               | Próxima Ação (Botão)        |
|------------------|------------------|--------------------------------------------|-----------------------------|
| **ABERTA**       | Verde            | Novo chamado aguardando um técnico.        | `Dar Ciência` (✅)          |
| **CIENTE**       | Azul             | Um técnico assumiu a OS.                   | `Iniciar Execução` (▶️)     |
| **EM EXECUÇÃO**  | Amarelo          | O técnico está trabalhando ativamente.     | `Finalizar Execução` (🛠️)   |
| **CONCLUÍDA**    | Cinza            | O serviço foi finalizado com sucesso.      | Nenhuma (arquivada)         |
| **CANCELADA**    | Vermelho         | O serviço não pôde ser concluído.          | Nenhuma (arquivada)         |

**Fluxo Detalhado:**

1. **Criação:** Um usuário cria uma OS, que entra no sistema com o status **ABERTA**.
2. **Ciência:** Um `MECANICO` ou `LIDER` visualiza a OS no dashboard e clica no ícone **✅ (Dar Ciência)**. O sistema registra o nome do responsável e a data/hora, e o status muda para **CIENTE**.
3. **Início da Execução:** Ao chegar no local para realizar o trabalho, o técnico clica no ícone **▶️ (Iniciar Execução)**. O status é atualizado para **EM EXECUÇÃO**.
4. **Finalização:** Após concluir o trabalho, o técnico clica no ícone **🛠️ (Finalizar Execução)**. Uma janela modal (`ExecucaoModal.jsx`) é aberta para que ele preencha os detalhes do serviço.
5. **Conclusão ou Cancelamento:** Dentro do modal, o técnico pode escolher entre **"Concluir OS"** ou **"Cancelar OS"**. A OS é então movida para seu estado final.

---

## 5. Guia de Instalação e Configuração

Para executar o projeto localmente, siga os passos abaixo.

### Pré-requisitos
* Java JDK 17+
* Maven 3.x
* Node.js 20+ e npm
* PostgreSQL

### Backend
1. **Configure o Banco de Dados:**
    * Crie um banco de dados no PostgreSQL chamado `osmanager`.
    * Abra o arquivo `src/main/resources/application.properties`.
    * Altere as propriedades `spring.datasource.username` e `spring.datasource.password` com suas credenciais do PostgreSQL.

2. **Execute a Aplicação:**
    * Navegue até a pasta raiz do projeto (`OS-Manager-Bag-e2c9a0d044954c1e0213bd66f1bb7ddebdf8f4e2`).
    * Execute o comando: `mvn spring-boot:run`.
    * A API estará disponível em `http://localhost:8080`.

    > **Nota:** Na primeira inicialização, um usuário **ADMIN** padrão será criado com o email `admin@empresa.com` e a senha `senha_forte_123`, conforme definido em `OsmanagerApplication.java`. Os dados de equipamentos e locais também serão populados a partir de `data.sql`.

### Frontend
1. **Instale as Dependências:**
    * Navegue até a pasta do frontend: `cd osmanager-frontend`.
    * Execute o comando: `npm install`.

2. **Execute a Aplicação:**
    * Ainda na pasta `osmanager-frontend`, execute: `npm run dev`.
    * A aplicação React estará disponível em `http://localhost:5173` (ou outra porta, se a 5173 estiver em uso).

    > **Nota:** O frontend já está configurado para se comunicar com a API backend através do proxy definido em `vite.config.js`, que redireciona todas as chamadas `/api` para `http://192.168.0.11:8080`. Certifique-se de que o endereço do proxy corresponde ao IP da máquina onde o backend está rodando, ou altere para `http://localhost:8080` se estiver rodando tudo na mesma máquina.
