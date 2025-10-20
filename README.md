# OS Manager - Sistema de Gerenciamento de Ordens de Serviço

## 1. Visão Geral do Projeto

O **OS Manager** é uma solução web completa projetada para modernizar e otimizar o gerenciamento de Ordens de Serviço (OS) de manutenção. Ele substitui processos manuais (planilhas, comunicações informais) por uma plataforma centralizada, transparente e eficiente.

### Principais Objetivos:

-   **Centralizar Solicitações**: Um único canal para abrir e acompanhar OS.
-   **Rastreabilidade em Tempo Real**: Status visível a todos os envolvidos.
-   **Fluxo de Trabalho Padrão**: Nenhuma etapa esquecida no processo.
-   **Gestão Simplificada**: Administração intuitiva de usuários, equipamentos, setores e locais.
-   **Automação de Preventivas**: Agendamento automático baseado em planos de manutenção definidos.

## 2. Tecnologias Utilizadas

### Backend (API)

-   **Framework**: Spring Boot
-   **Linguagem**: Java 17
-   **Segurança**: Spring Security + JWT
-   **Acesso a Dados**: Spring Data JPA (Hibernate)
-   **Banco de Dados**: PostgreSQL
-   **Build Tool**: Maven

### Frontend (Aplicação Web)

-   **Framework**: React 18
-   **Build Tool**: Vite
-   **Roteamento**: React Router DOM
-   **HTTP Requests**: Axios com JWT Interceptors
-   **Componentes**: React Big Calendar, React-to-Print
-   **Estilização**: CSS modular

## 3. Funcionalidades Detalhadas

### 🛠️ Módulo de Ordens de Serviço

-   Criação unificada de OS (Corretiva e Preventiva).
-   Dashboard Interativo com filtros por status, data, equipamento, etc.
-   Ações rápidas no painel (Dar ciência, Iniciar, Executar, Verificar).
-   Página de detalhes com histórico completo e opção de impressão.
-   Registro de execução com checklist para preventivas, tempo de parada e peças utilizadas.

### 📅 Calendário de Manutenção

-   Visualização mensal de OS Corretivas e Preventivas agendadas.
-   Projeção de futuras manutenções preventivas com base na frequência.
-   Navegação entre períodos.
-   Cores por status (Previsto, Agendado, Concluído).
-   Acesso rápido aos detalhes da OS via clique no evento.

### ⚙️ Módulo Administrativo

-   **Funcionários**: CRUD completo com edição e exclusão "inline".
-   **Equipamentos**: Cadastro de equipamentos, associando os tipos de serviços aplicáveis a cada um.
-   **Serviços de Manutenção**: Catálogo centralizado de todos os serviços (ex: "Verificar nível do óleo").
-   **Frequências**: Gerenciamento de frequências de manutenção (diário, semanal, mensal, etc.).
-   **Setores e Locais**: Cadastro e gerenciamento hierárquico dos locais da fábrica.

### 🔐 Controle de Acesso e Perfis (via `TipoFuncionario`)

-   **ADMIN**: Acesso total ao sistema.
-   **ENCARREGADO**: Aprovação/reprovação de OS preventivas concluídas.
-   **LIDER / MECANICO**: Execução de Ordens de Serviço.
-   **SOLICITANTE**: Apenas criação e acompanhamento de suas próprias OS.

## 4. Guia de Uso: Ciclo de Vida de uma OS

| Status                  | Cor no Dashboard       | Significado                                         | Próxima Ação          |
|-------------------------|------------------------|-----------------------------------------------------|------------------------|
| **ABERTA** | Verde                  | Novo chamado aguardando técnico                     | ✅ Dar Ciência         |
| **PENDENTE** | Azul                   | Técnico assumiu e está ciente da OS                 | ▶️ Iniciar Execução   |
| **EM EXECUÇÃO** | Amarelo                | Técnico está executando o serviço                   | 🛠️ Finalizar Execução |
| **AGUARDANDO VERIFICAÇÃO** | Laranja             | (Preventiva) Aguardando verificação de encarregado  | 🔍 Verificar OS        |
| **CONCLUÍDA** | Cinza                  | Serviço finalizado com sucesso                      | —                      |
| **CANCELADA** | Vermelho               | Serviço cancelado                                   | —                      |

### Fluxo Detalhado
1. **Criação**: Uma OS é criada com o status `ABERTA`.
2. **Ciência**: Um técnico assume a responsabilidade, e o status muda para `PENDENTE`.
3. **Execução**: O técnico inicia o trabalho, e o status muda para `EM EXECUÇÃO`.
4. **Finalização**:
   - Se for **Corretiva**, o status vai para `CONCLUÍDA`.
   - Se for **Preventiva**, o status muda para `AGUARDANDO VERIFICAÇÃO`.
5. **Verificação** (apenas para Preventivas): Um ENCARREGADO aprova (status `CONCLUÍDA`) ou reprova (status volta para `EM EXECUÇÃO`).
6. **Agendamento Automático**: Ao concluir uma OS Preventiva, o sistema automaticamente cria a próxima OS com base na frequência definida.

## 5. Guia de Instalação e Configuração

### Pré-requisitos
- Java JDK 17+
- Maven 3.x
- Node.js 20+ e npm
- PostgreSQL

### Backend
1. **Crie o banco de dados**:
   ```sql
   CREATE DATABASE osmanager;
   ```
2. **Configure o `application.properties`**:
   ```properties
   spring.datasource.username=seu_usuario
   spring.datasource.password=${DB_PASSWORD}
   ```
3. **Execute o projeto**:
   ```bash
   mvn spring-boot:run
   ```
   Acesse em: `http://localhost:8080`

> ⚠️ Na primeira execução, um usuário **ADMIN** padrão será criado:  
> **Email**: `admin@empresa.com`  
> **Senha**: `senha_forte_123`

### Frontend
1. Instale as dependências:
   ```bash
   cd osmanager-frontend
   npm install
   ```
2. Execute o projeto:
   ```bash
   npm run dev
   ```
   Acesse em: `http://localhost:5173`

> 🔁 Verifique se o proxy no arquivo `vite.config.js` está apontando para o endereço correto do seu backend (ex: `http://localhost:8080`).

## 📷 Visuais do Sistema

### 🛠️ Criar uma Ordem de Serviço
![Criar OS](assets/criar-os.png)

### 🔄 Fluxograma da Ordem de Serviço
![Fluxograma OS](assets/fluxograma-os.png)

### 📌 Barra de Navegação do Sistema
![Navbar OS](assets/NavBar-OS.png)

## 📌 Licença

Este projeto é de código fechado e restrito ao uso interno da equipe de desenvolvimento da empresa. Para mais informações, entre em contato com o administrador do sistema.
