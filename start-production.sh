#!/bin/bash

# Script para iniciar a aplicação em produção
cd /www/wwwroot/myluck.primesollutions.com.br

# Instalar dependências (se necessário)
npm install --legacy-peer-deps

# Build para produção
npm run build

# Iniciar em modo produção na porta 3004
PORT=3004 npm start
