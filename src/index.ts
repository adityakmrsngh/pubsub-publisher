import express from 'express';
import { publishJson } from './pubsub.js';
import { logger } from './logger.js';
import { WEBHOOK_ENDPOINTS, HTTP_STATUS, WHATSAPP_EVENTS, ENV_VARS } from './constants.js';
import { WhatsAppWebhookSchema } from './schemas/whatsapp.schema.js';

const app = express();
app.use(express.json());

app.get(WEBHOOK_ENDPOINTS.HEALTH, (_req, res) => {
  res.status(HTTP_STATUS.OK).send('ok');
});

// WhatsApp webhook verification endpoint
app.get(WEBHOOK_ENDPOINTS.WEBHOOK, (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === ENV_VARS.WEBHOOK_VERIFY_TOKEN) {
    logger.info('Webhook verificado correctamente');
    res.status(HTTP_STATUS.OK).send(challenge);
  } else {
    logger.warn({ 
      mode: mode as string, 
      token: token as string 
    }, 'Verificación de webhook fallida');
    res.status(HTTP_STATUS.FORBIDDEN).json({ error: 'Token de verificación inválido' });
  }
});

app.post(WEBHOOK_ENDPOINTS.WEBHOOK, async (req, res) => {
  // Log incoming webhook for debugging
  logger.debug({ 
    body: req.body,
    headers: req.headers 
  }, 'Webhook recibido');

  const parse = WhatsAppWebhookSchema.safeParse(req.body);
  
  if (!parse.success) {
    // Enhanced error logging with actual payload
    logger.error({ 
      error: parse.error,
      zodErrors: parse.error.errors,
      receivedPayload: req.body,
      payloadType: typeof req.body,
      payloadKeys: req.body ? Object.keys(req.body) : []
    }, 'Validación de webhook fallida');
    
    return res
      .status(HTTP_STATUS.BAD_REQUEST)
      .json({ 
        error: 'Body inválido', 
        details: parse.error.flatten(),
        message: 'El payload del webhook no cumple con el esquema esperado de WhatsApp API v23.0'
      });
  }

  const payload = parse.data;

  // Log successful validation
  logger.info({ 
    entryCount: payload.entry.length,
    messageTypes: payload.entry.flatMap(e => 
      e.changes.flatMap(c => 
        c.value.messages?.map(m => m.type) || []
      )
    ),
    hasStatuses: payload.entry.some(e => 
      e.changes.some(c => c.value.statuses && c.value.statuses.length > 0)
    )
  }, 'Webhook validado correctamente');

  try {
    const messageId = await publishJson(payload, {
      eventType: WHATSAPP_EVENTS.EVENT_TYPE,
    });
    
    logger.info({ messageId }, 'Mensaje publicado en Pub/Sub exitosamente');
    res.status(HTTP_STATUS.ACCEPTED).json({ messageId });
  } catch (err: any) {
    logger.error({ err, payload }, 'Error publicando en Pub/Sub');
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ 
      error: 'Error publicando el mensaje',
      message: 'No se pudo publicar el mensaje en Pub/Sub'
    });
  }
});

// Manejo básico de errores no capturados
process.on('uncaughtException', (e) => logger.error(e, 'uncaughtException'));
process.on('unhandledRejection', (e) =>
  logger.error(e as any, 'unhandledRejection')
);

// Validate required environment variables on startup
if (!ENV_VARS.WEBHOOK_VERIFY_TOKEN) {
  logger.warn('WEBHOOK_VERIFY_TOKEN no está configurado - la verificación de webhook fallará');
}

const port = ENV_VARS.PORT;
app.listen(port, () => logger.info(`Publisher escuchando en :${port}`));
