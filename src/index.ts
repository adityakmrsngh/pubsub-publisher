import express from 'express';
import { z } from 'zod';
import { publishJson } from './pubsub.js';
import { logger } from './logger.js';
import { WEBHOOK_ENDPOINTS, HTTP_STATUS, WHATSAPP_EVENTS, ENV_VARS } from './constants.js';

const app = express();
app.use(express.json());

// WhatsApp webhook payload schemas
const WhatsAppContactSchema = z.object({
  profile: z.object({
    name: z.string(),
  }),
  wa_id: z.string(),
});

const WhatsAppMetadataSchema = z.object({
  phone_number_id: z.string(),
  display_phone_number: z.string(),
});

const WhatsAppImageSchema = z.object({
  sha256: z.string(),
  mime_type: z.string(),
  id: z.string(),
});

const WhatsAppVideoSchema = z.object({
  id: z.string(),
  mime_type: z.string(),
  sha256: z.string(),
});

const WhatsAppDocumentSchema = z.object({
  filename: z.string(),
  mime_type: z.string(),
  id: z.string(),
  sha256: z.string(),
});

const WhatsAppReactionSchema = z.object({
  emoji: z.string(),
  message_id: z.string(),
});

const WhatsAppTextSchema = z.object({
  body: z.string(),
});

const WhatsAppPricingSchema = z.object({
  billable: z.boolean(),
  category: z.string(),
  type: z.string(),
  pricing_model: z.string(),
});

const WhatsAppConversationSchema = z.object({
  id: z.string(),
  origin: z.object({
    type: z.string(),
  }),
});

const WhatsAppStatusSchema = z.object({
  id: z.string(),
  status: z.enum(['sent', 'delivered', 'read', 'failed']),
  pricing: WhatsAppPricingSchema,
  recipient_id: z.string(),
  timestamp: z.string(),
  conversation: WhatsAppConversationSchema,
});

const WhatsAppMessageSchema = z.object({
  id: z.string(),
  type: z.enum(['text', 'image', 'video', 'document', 'reaction']),
  timestamp: z.string(),
  from: z.string(),
  text: WhatsAppTextSchema.optional(),
  image: WhatsAppImageSchema.optional(),
  video: WhatsAppVideoSchema.optional(),
  document: WhatsAppDocumentSchema.optional(),
  reaction: WhatsAppReactionSchema.optional(),
});

const WhatsAppValueSchema = z.object({
  messaging_product: z.string(),
  metadata: WhatsAppMetadataSchema,
  contacts: z.array(WhatsAppContactSchema).optional(),
  messages: z.array(WhatsAppMessageSchema).optional(),
  statuses: z.array(WhatsAppStatusSchema).optional(),
});

const WhatsAppChangeSchema = z.object({
  field: z.string(),
  value: WhatsAppValueSchema,
});

const WhatsAppEntrySchema = z.object({
  id: z.string(),
  changes: z.array(WhatsAppChangeSchema),
});

const WhatsAppWebhookSchema = z.object({
  object: z.string(),
  entry: z.array(WhatsAppEntrySchema),
});

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
    logger.warn('Verificación de webhook fallida', { mode, token });
    res.status(HTTP_STATUS.FORBIDDEN).json({ error: 'Token de verificación inválido' });
  }
});

app.post(WEBHOOK_ENDPOINTS.WEBHOOK, async (req, res) => {
  const parse = WhatsAppWebhookSchema.safeParse(req.body);
  if (!parse.success) {
    logger.error({ error: parse.error }, 'Body inválido');
    return res
      .status(HTTP_STATUS.BAD_REQUEST)
      .json({ error: 'Body inválido', details: parse.error.flatten() });
  }

  const payload = parse.data;

  try {
    const messageId = await publishJson(payload, {
      eventType: WHATSAPP_EVENTS.EVENT_TYPE,
    });
    res.status(HTTP_STATUS.ACCEPTED).json({ messageId });
  } catch (err: any) {
    logger.error({ err }, 'Error publicando en Pub/Sub');
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: 'Error publicando el mensaje' });
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
