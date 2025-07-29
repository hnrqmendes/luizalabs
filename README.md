# Desafio Técnico – LuizaLabs
## Henrique Dornas Mendes

Este projeto foi desenvolvido com o objetivo de implementar o que foi proposto no desafio considerando boas práticas de desenvolvimento e de arquitetura.
Por ser um desafio técnico optei por não utilizar frameworks, visto que em termos gerais, facilitam muito o desenvolvimento e manipulação da linguagem.
A escolha da utilização de Node.js com typescript foi tanto pela leveza, escalabilidade, clareza de código e robustez para aplicações desse modelo, quanto pelo fato de serem tecnologias que foram citadas como de uso frequente na empresa.
Para persistência optei por um banco relacional, devido aos relacionamentos entre pedidos, produtos e usuários, e escolhi o sqlite pela simplicidade de configuração, visto que sendo um desafio técnico, o código precisa rodar com facilidade em outros ambientes.

---

## 🧠 Visão Geral

A API oferece funcionalidades para:

- Upload de arquivos contendo pedidos (via `multipart/form-data`)
- Consulta individual de pedidos por ID
- Consulta de pedidos por datas
- Consulta geral de pedidos
- Armazenamento e tratamento dos dados

---

## ▶️ Como Executar

### 1. Instale as dependências:
npm install

### 2. Execute a aplicação:
npm run dev

### 3. Acesse a aplicação
Por padrão a porta de execução é a 3000, mas pode ser definida no .env
A documentação com o swagger estará em execução no endpoint http://localhost:{PORT}/docs

---

## 🛠 Tecnologias Utilizadas

- **Linguagem:** Node.js (TypeScript)
- **Documentação:** Swagger UI com JSDoc (`swagger-jsdoc`, `swagger-ui-dist`)
- **Persistência:** SQLite
- **Dependências:**
  - `swagger-jsdoc`
  - `swagger-ui-dist`
  - `better-sqlite3`
  - `busboy`
  - `dotenv`
---

## 🧱 Arquitetura e Organização

O projeto segue uma estrutura modular baseada na separação de responsabilidades, facilitando a manutenção e a escalabilidade da aplicação:

### 🔹 src/controller/
Contém os tratamentos de rotas após serem identificadas no router. Nenhuma lógica de negócio pesada é tratada nesse nível.

### 🔹 src/service/
Camada onde está a lógica de negócio. Centraliza o processamento, leitura e transformação dos dados. Pode ser chamado tanto pelo controller, quanto pelo router, a depender do tipo de tratamento exigido.

### 🔹 src/config/
Responsável por configurações globais da aplicação, como de variáveis de ambiente e de documentação.

### 🔹 src/type/
Define os tipos de dados usados em todo o projeto.

### 🔹 src/uploads/
Contém os arquivos que tiveram o upload feito. Só é criado após o primeiro upload

### 🔹 src/util/
Funções auxiliares e genéricas que não pertencem a nenhuma camada específica de negócio.

### 🔹 test/
Armazena os testes automatizados da aplicação, organizados por funcionalidade. Garante que os módulos funcionem corretamente e serve como uma rede de segurança para futuras mudanças.

### 🔹 __mocks__/
Mocks para execução dos testes

### 🔹 public/
Arquivos públicos, inicialmente do swagger

---