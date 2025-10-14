import { PubSub } from '@google-cloud/pubsub';
import { logger } from './logger.js';

const projectId = process.env.GOOGLE_CLOUD_PROJECT;
const topicId = process.env.TOPIC_ID || '';

if (!projectId) {
  throw new Error(
    'GOOGLE_CLOUD_PROJECT no está definido en variables de entorno'
  );
}

if (!topicId) {
  throw new Error('TOPIC_ID no está definido en variables de entorno');
}


if (
  !process.env.GOOGLE_CLOUD_EMAIL &&
  !process.env.GOOGLE_CLOUD_PRIVATE_KEY
) {
  logger.info('Using Application Default Credentials (ADC) for authentication');
}

export const pubsub = new PubSub({
  projectId,
  credentials: {
    client_email: process.env.GOOGLE_CLOUD_EMAIL || '',
    private_key: process.env.GOOGLE_CLOUD_PRIVATE_KEY?.replace(/\\n/g, '\n') || '',
  },
});

export async function publishJson(
  data: unknown,
  attributes: Record<string, string> = {}
) {
  const topic = pubsub.topic(topicId, {
    batching: { maxMessages: 100, maxMilliseconds: 1000 },
  });

  const buffer = Buffer.from(JSON.stringify(data));
  const messageId = await topic.publishMessage({
    data: buffer,
    attributes,
  });

  logger.info({ messageId, attributes }, 'Mensaje publicado');
  return messageId;
}
