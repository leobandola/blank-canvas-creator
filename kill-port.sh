#!/bin/bash
# Script para matar processos em uma porta específica

PORT=${1:-3000}

echo "Procurando processos na porta $PORT..."
PID=$(lsof -ti:$PORT)

if [ -z "$PID" ]; then
  echo "Nenhum processo encontrado na porta $PORT"
else
  echo "Matando processo(s): $PID"
  kill -9 $PID
  echo "Processo(s) finalizado(s) com sucesso!"
fi
