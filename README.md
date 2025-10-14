### Variables de entorno
- TOPIC_ID (obligatoria)
- PROJECT_ID (opcional en Cloud Run; normalmente se infiere)
- LOG_LEVEL (opcional)

### Request de ejemplo
POST /publish
{
  "idempotencyKey": "order-123",
  "eventType": "order.created",
  "payload": { "orderId": 123, "amount": 999 }
}
