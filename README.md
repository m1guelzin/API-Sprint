📚 Sistema de Reservas de Salas de Aula (SENAI)
Este projeto é um sistema completo para gerenciamento e reserva de salas de aula. Ele é composto por três sprints (API, Front-end Web e Mobile) que se comunicam para oferecer uma solução robusta e funcional.

Status do Projeto: Finalizado (Desenvolvido para fins de estudo e portfólio, sem implantação em produção).

💡 Arquitetura Geral
O sistema segue uma arquitetura baseada em API RESTful:

Front_Sprint (Web) e Mobile_Sprint (App): Consomem os dados da API_Sprint.

API_Sprint (Back-end): Gerencia a lógica de negócio e persiste os dados no MySQL.

🚀 Como Executar o Projeto Localmente
Para rodar todo o ecossistema, siga a ordem abaixo para configurar cada parte do projeto.

1. ⚙️ API_Sprint (Back-end)
O back-end é responsável por todas as regras de negócio e comunicação com o banco de dados.

Detalhe	Informação
Tecnologia	Node.js com Express
Banco de Dados	MySQL
Autenticação	JSON Web Token (JWT)
URL Base	/project-senai/api/v1

Exportar para as Planilhas
Pré-requisitos
Node.js instalado.

Servidor MySQL rodando.

Setup e Instalação
Configurar o Banco de Dados:

O schema e dados iniciais do banco estão no arquivo mysql-init/init.sql.

Crie o banco de dados e importe o conteúdo desse arquivo.

Instalar Dependências:

Bash

cd [caminho_da_API_Sprint]
npm install

Configure as variáveis de ambiente

crie o .env na raiz do projeto para ligar o banco de dados com a API

seguindo o .env.example.

Iniciar a API:

Bash

npm start
A API estará rodando localmente (normalmente na porta 3000, verifique as variáveis de ambiente).

Principais Endpoints
Método	Rota	Descrição	Requer JWT
POST	/user	Cria um novo usuário.	Não
POST	/login	Efetua login e retorna um token JWT.	Não
GET	/reservas	Lista todas as reservas.	Não
POST	/reservas	Cria uma nova reserva.	Sim
GET	/salas/disponiveis/:data	Lista salas disponíveis em uma data.	Sim
GET	/salas	Lista todas as salas cadastradas.	Sim

Exportar para as Planilhas
(Para a lista completa de rotas, consulte o arquivo apiRoutes.js)

2. 💻 Front_Sprint (Web)
A interface web para acesso via navegador.

Detalhe	Informação
Tecnologia	React
Consome API	API_Sprint (Node.js)

Exportar para as Planilhas
Setup e Instalação
Instalar Dependências:

Bash

cd [caminho_do_Front_Sprint]
npm install
Iniciar o Projeto:

Bash

npm run dev
O projeto Web estará acessível no seu navegador (normalmente em localhost:5173 ou similar).

3. 📱 Mobile_Sprint (App)
O aplicativo móvel para acesso via smartphones.

Detalhe	Informação
Tecnologia	React Native
Ferramenta	Expo

Exportar para as Planilhas
Setup e Instalação
Instalar Dependências:

Bash

cd [caminho_do_Mobile_Sprint]
npm i (ou npx i)
Iniciar o Projeto:

Bash

npx expo start
O terminal gerará um QRCode. Use o aplicativo Expo Go no seu celular para escanear e rodar o app, ou use um emulador/simulador no seu computador.

🧑‍💻 Autor e Contato
Desenvolvido por: Miguel Garrido Souza

Email: miguelgarridodev@gmail.com

LinkedIn: www.linkedin.com/in/miguel-garrido-dev
