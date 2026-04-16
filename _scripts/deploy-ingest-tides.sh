#!/bin/bash
# deploy-ingest-tides.sh
# Faz deploy da Edge Function ingest-tides para o Supabase.
# Executar manualmente após criar a tabela tides e configurar o secret WORLDTIDES_KEY.
#
# Pré-requisitos:
#   1. supabase CLI instalado: npm i -g supabase
#   2. Autenticado: supabase login
#   3. Linked ao projeto: supabase link --project-ref glupdjvdvunogkqgxoui
#   4. Secret configurado no dashboard:
#      Supabase → Settings → Edge Functions → Secrets → Add WORLDTIDES_KEY
#
# Uso:
#   bash _scripts/deploy-ingest-tides.sh

set -e

echo "[deploy] A fazer deploy de ingest-tides..."
supabase functions deploy ingest-tides --no-verify-jwt

echo ""
echo "[deploy] Concluído."
echo ""
echo "Próximo passo — activar cron (cron-job.org):"
echo "  URL: https://glupdjvdvunogkqgxoui.supabase.co/functions/v1/ingest-tides"
echo "  Método: POST"
echo "  Header: Authorization: Bearer <SUPABASE_SERVICE_ROLE_KEY>"
echo "  Schedule: Todos os dias às 06:00 UTC"
