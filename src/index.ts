import express from 'express';
import { z } from 'zod';
import { publishJson } from './pubsub.js';
import { logger } from './logger.js';
import { v4 as uuidv4 } from 'uuid';

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

app.get('/healthz', (_req, res) => {
  res.status(200).send('ok');
});

app.post('/publish', async (req, res) => {
  const parse = WhatsAppWebhookSchema.safeParse(req.body);
  if (!parse.success) {
    console.log(parse.error);
    return res
      .status(400)
      .json({ error: 'Body inválido', details: parse.error.flatten() });
  }

  const payload = parse.data;

  // Generate idempotency key based on available data
  let idempotencyKey = uuidv4();
  const change = payload.entry[0].changes[0].value;
  
  if (change.messages && change.messages.length > 0) {
    idempotencyKey = change.messages[0].id;
  } else if (change.statuses && change.statuses.length > 0) {
    idempotencyKey = change.statuses[0].id;
  }

  const eventType = 'whatsapp';

  try {
    const messageId = await publishJson(payload, {
      eventType,
      ...(idempotencyKey ? { idempotencyKey } : {}),
    });
    res.status(202).json({ messageId });
  } catch (err: any) {
    logger.error({ err }, 'Error publicando en Pub/Sub');
    res.status(500).json({ error: 'Error publicando el mensaje' });
  }
});

// Manejo básico de errores no capturados
process.on('uncaughtException', (e) => logger.error(e, 'uncaughtException'));
process.on('unhandledRejection', (e) =>
  logger.error(e as any, 'unhandledRejection')
);

const port = process.env.PORT || 8080;
app.listen(port, () => logger.info(`Publisher escuchando en :${port}`));
