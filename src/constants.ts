export const WEBHOOK_ENDPOINTS = {
  WEBHOOK: '/webhook',
  HEALTH: '/healthz'
} as const;

export const HTTP_STATUS = {
  OK: 200,
  ACCEPTED: 202,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  INTERNAL_SERVER_ERROR: 500
} as const;

export const WHATSAPP_EVENTS = {
  WEBHOOK_OBJECT: 'whatsapp_business_account',
  EVENT_TYPE: 'whatsapp'
} as const;

export const ENV_VARS = {
  PORT: process.env.PORT || '8080',
  NODE_ENV: process.env.NODE_ENV || 'development',
  WEBHOOK_VERIFY_TOKEN: process.env.WEBHOOK_VERIFY_TOKEN || '',
  LOG_LEVEL: process.env.LOG_LEVEL || 'info'
} as const;
