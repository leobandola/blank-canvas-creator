#!/bin/bash

echo "======================================"
echo "Deploy da Aplicação de Bolão"
echo "======================================"

# Diretório da aplicação
APP_DIR="/www/wwwroot/myluck.primesollutions.com.br"
cd $APP_DIR

echo "1. Parando processos existentes..."
pkill -f "npm run dev" 2>/dev/null || true
pkill -f "next dev" 2>/dev/null || true
pkill -f "next start" 2>/dev/null || true

echo "2. Limpando builds antigos..."
rm -rf .next

echo "3. Instalando dependências..."
npm install --legacy-peer-deps

echo "4. Fazendo build de produção..."
npm run build

if [ $? -eq 0 ]; then
    echo "======================================"
    echo "✓ Build concluído com sucesso!"
    echo "======================================"
    echo ""
    echo "Próximos passos:"
    echo "1. No Supervisor do aaPanel, configure o daemon 'loteria'"
    echo "2. Start command: npm start"
    echo "3. Process directory: $APP_DIR"
    echo "4. Clique em 'Confirm' e depois em 'Start'"
    echo ""
    echo "Para testar manualmente:"
    echo "  PORT=3004 npm start"
else
    echo "======================================"
    echo "✗ Erro no build!"
    echo "======================================"
    exit 1
fi
