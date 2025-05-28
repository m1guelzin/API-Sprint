#  Baixa e executa a imagem do node na versão Alpine (versão simplificada)
FROM node:alpine

# Define o local onde o app irá ficar no disco do container
# O caminho o Dev quem escolhe
WORKDIR /usr/app

# Copia tudo que começa com package e termina com. json para dentro de usr/app
COPY package*.json ./

# Executa npm install para adicionar todas as dependencias e criar a pasta node_modulues
RUN npm install

# Copia tudo que esta no diretorio  onde o arquivo Dockerfile está
# Será copiado dentro da pasta /usr/app do container
# Vamos ignorar a node_modules (.dockerignore)
COPY . .

# Container ficará ouvindo os acessos na porta 3000
EXPOSE 3000

# Executa o comando para iniciar o script que está no package.json
CMD npm start

# docker exec -it e38a12e2944684237f8e60e92f4c98892c858a3f03475010445c6f171f8d4fad mysql -u root -p