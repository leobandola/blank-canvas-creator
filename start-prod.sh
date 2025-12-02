#!/bin/bash

# Script para iniciar em produção
cd /www/wwwroot/myluck.primesollutions.com.br

# Definir variáveis de ambiente
export PORT=3004
export NODE_ENV=production

# Iniciar aplicação
exec npm start
