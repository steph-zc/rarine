<div align="center">

# 🧵 Rarine — Sistema de Gestão de Confecções

**ERP web para a Rarine Confecções — A Casa dos Uniformes**

Substitui o fluxo informal de pedidos via WhatsApp por uma plataforma estruturada que
centraliza clientes, catálogo de produtos, cores de bordado e ordens de serviço —
do primeiro contato até a entrega, com geração de ficha técnica em PDF.

<br>

![Java](https://img.shields.io/badge/Java-21-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.5-6DB33F?style=for-the-badge&logo=springboot&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-18-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=for-the-badge&logo=vite&logoColor=white)

</div>

---

## 📑 Sumário

- [Sobre o projeto](#-sobre-o-projeto)
- [Funcionalidades](#-funcionalidades)
- [Tecnologias](#-tecnologias)
- [Como executar](#-como-executar)
- [Ficha técnica em PDF](#-ficha-técnica-em-pdf)
- [Equipe](#-equipe)

---

## 📖 Sobre o projeto

A **Rarine Confecções** é uma unidade produtiva localizada em Santiago (RS), especializada
em uniformes, peças bordadas e estampadas. Antes do sistema, os pedidos eram tratados
informalmente por mensagens, sem padronização nem histórico consolidado — o que gerava
erros de especificação (principalmente nas cores de bordado) e dificultava a rastreabilidade.

O **Rarine** é uma aplicação web *fullstack* inspirada no modelo **ERP**, desenvolvida no
âmbito do **Projeto Integrador III — Módulo Extensionista** do curso de Ciência da
Computação da **URI — Câmpus de Santiago**. Opera nos computadores já existentes na empresa
por meio do navegador: o backend expõe uma **API REST** consumida pelo frontend.

---

## ✨ Funcionalidades

### 👥 Módulo de Clientes
- Cadastro de **Pessoa Física (PF)** e **Pessoa Jurídica (PJ)** com campos específicos por tipo
- Busca por nome, edição, **inativação** e **reativação** (sem perda de histórico)
- **Perfil do cliente**: dados completos, último pedido e histórico — com **preço por peça**
  editável por item (bloqueado após o status *Entregue*) e repositório de arquivos anexados

### 👕 Módulo de Catálogo de Produtos
- Modelos reutilizáveis de peças: **Nome**, **Modelo** (manga curta/longa/raglan/cavada),
  **Gola** (redonda/polo/V/canoa), **Tecido** (algodão/dry/cross/PV/nylon leve/nylon pesado),
  **Cor base** e **locais de aplicação** de bordado/estampa
- **Snapshot** do produto no momento do pedido (edições futuras não afetam OS já geradas)
- Exclusão segura: pedidos antigos permanecem íntegros

### 🎨 Módulo de Cores de Bordado
- Biblioteca padronizada de **+80 cores** com nome, **código da linha** e tonalidade hexadecimal
- Alerta consultivo de duplicidade (nome ou código) — não bloqueia o cadastro
- Edição e exclusão livres quando a cor não está mais em uso

### 📋 Módulo de Pedidos / Ordem de Serviço
- Ciclo de vida em 4 fases: **Pedido → Em Produção → Pronto → Entregue**
- Prazo sugerido automaticamente (15 dias úteis, editável)
- Itens puxam características e estampa/bordado do produto; cores por local de aplicação
- Locais de estampa: **frente grande/pequena, costas grande/pequena, manga direita/esquerda**
- Alerta acima de **6 cores** por bordado (limite do maquinário)
- Anexo de arquivos (PDF, CDR, imagens — até **10 MB**), abertura no navegador e
  seleção da imagem que vai para a ficha técnica
- Geração da **ficha técnica em PDF** fiel ao modelo padrão da Rarine

---

## 🛠 Tecnologias

| Camada | Stack |
|---|---|
| **Backend** | Java 21 · Spring Boot 3.5 (Web, Validation, Data JPA) · Hibernate |
| **Banco de dados** | PostgreSQL · Flyway (migrações versionadas) |
| **Geração de PDF** | OpenPDF 1.3.30 |
| **Frontend** | React 19 · Vite 8 · React Router 7 · Bootstrap 5 + Bootstrap Icons |
| **Build** | Maven (backend) · npm (frontend) |

---

## 🚀 Como executar

### Pré-requisitos
- **Java 21** e **Maven**
- **Node.js 18+** e **npm**
- **PostgreSQL** rodando em `localhost:5432`

### 1. Banco de dados

Crie o banco e o usuário conforme `backend/src/main/resources/application.yml`:

```sql
CREATE DATABASE rarine;
CREATE USER rarine WITH PASSWORD 'rarine';
GRANT ALL PRIVILEGES ON DATABASE rarine TO rarine;
```

> As tabelas são criadas automaticamente pelo **Flyway** ao subir o backend.

### 2. Backend (API · porta 8080)

```bash
cd backend
mvn spring-boot:run
```

### 3. Frontend (porta 5173)

```bash
cd frontend
npm install
npm run dev
```

Acesse **http://localhost:5173**.

### 4. (Opcional) Popular cores de bordado

Com o backend no ar:

```bash
node seed_cores.js
```

---

## 🖨 Ficha técnica em PDF

Gerada no backend com **OpenPDF**, reproduzindo fielmente o modelo padrão da Rarine —
fontes, tamanhos, negrito, margens e espaçamento idênticos, **sempre em uma única página A4**.

- Preenche automaticamente: **número do pedido**, **imagem selecionada**, dados do cliente
  (Cliente, Telefone/WhatsApp, Cidade e CNPJ — já formatados) e a descrição
  (**Material, Gola, Estampa, Bordado e Cores**)
- **Bordado** e **Cores** quebram em múltiplas linhas (justificado) quando o conteúdo é longo
- As seções **DETALHES** (10 linhas) e **OBSERVAÇÕES** (3 linhas) permanecem em branco para
  preenchimento à mão após a impressão

---

## 👨‍💻 Equipe

Projeto Integrador III — Módulo Extensionista · Ciência da Computação · **URI Câmpus de Santiago** · 2026

Daniel Lamberti · Eduardo Vargas · Fernando Azzolin · João Victor Lima · Stefan Zanini

**Coordenadora:** Prof.ª Carla Castanho

---

<div align="center">
<sub>Desenvolvido como ferramenta de extensão universitária para a Rarine Confecções — A Casa dos Uniformes.</sub>
</div>
