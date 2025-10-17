import { z } from 'zod';

/**
 * WhatsApp Cloud API v23.0 Webhook Schemas
 * 
 * Comprehensive schemas for all message types and webhook payloads
 * Reference: https://developers.facebook.com/docs/whatsapp/cloud-api/webhooks/components
 */

// ============================================================================
// Base Schemas
// ============================================================================

/**
 * Contact information schema
 */
export const WhatsAppContactSchema = z.object({
  profile: z.object({
    name: z.string(),
  }),
  wa_id: z.string(),
}).passthrough();

/**
 * Metadata about the phone number receiving the message
 */
export const WhatsAppMetadataSchema = z.object({
  phone_number_id: z.string(),
  display_phone_number: z.string(),
}).passthrough();

// ============================================================================
// Media Schemas
// ============================================================================

/**
 * Image message schema
 */
export const WhatsAppImageSchema = z.object({
  id: z.string(),
  mime_type: z.string(),
  sha256: z.string(),
  caption: z.string().optional(),
}).passthrough();

/**
 * Video message schema
 */
export const WhatsAppVideoSchema = z.object({
  id: z.string(),
  mime_type: z.string(),
  sha256: z.string(),
  caption: z.string().optional(),
}).passthrough();

/**
 * Audio message schema (includes voice messages)
 */
export const WhatsAppAudioSchema = z.object({
  id: z.string(),
  mime_type: z.string(),
  sha256: z.string().optional(),
}).passthrough();

/**
 * Document message schema
 */
export const WhatsAppDocumentSchema = z.object({
  id: z.string(),
  mime_type: z.string(),
  sha256: z.string(),
  filename: z.string(),
  caption: z.string().optional(),
}).passthrough();

/**
 * Sticker message schema
 */
export const WhatsAppStickerSchema = z.object({
  id: z.string(),
  mime_type: z.string(),
  sha256: z.string(),
  animated: z.boolean().optional(),
}).passthrough();

// ============================================================================
// Message Content Schemas
// ============================================================================

/**
 * Text message schema
 */
export const WhatsAppTextSchema = z.object({
  body: z.string(),
}).passthrough();

/**
 * Location message schema
 */
export const WhatsAppLocationSchema = z.object({
  latitude: z.number(),
  longitude: z.number(),
  name: z.string().optional(),
  address: z.string().optional(),
}).passthrough();

/**
 * Contact message schema
 */
export const WhatsAppContactsSchema = z.object({
  addresses: z.array(z.object({
    street: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    zip: z.string().optional(),
    country: z.string().optional(),
    country_code: z.string().optional(),
    type: z.string().optional(),
  }).passthrough()).optional(),
  birthday: z.string().optional(),
  emails: z.array(z.object({
    email: z.string().optional(),
    type: z.string().optional(),
  }).passthrough()).optional(),
  name: z.object({
    formatted_name: z.string(),
    first_name: z.string().optional(),
    last_name: z.string().optional(),
    middle_name: z.string().optional(),
    suffix: z.string().optional(),
    prefix: z.string().optional(),
  }).passthrough(),
  org: z.object({
    company: z.string().optional(),
    department: z.string().optional(),
    title: z.string().optional(),
  }).passthrough().optional(),
  phones: z.array(z.object({
    phone: z.string().optional(),
    wa_id: z.string().optional(),
    type: z.string().optional(),
  }).passthrough()).optional(),
  urls: z.array(z.object({
    url: z.string().optional(),
    type: z.string().optional(),
  }).passthrough()).optional(),
}).passthrough();

/**
 * Reaction message schema
 */
export const WhatsAppReactionSchema = z.object({
  message_id: z.string(),
  emoji: z.string(),
}).passthrough();

// ============================================================================
// Interactive Message Schemas
// ============================================================================

/**
 * Button reply schema
 */
export const WhatsAppButtonReplySchema = z.object({
  id: z.string(),
  title: z.string(),
}).passthrough();

/**
 * List reply schema
 */
export const WhatsAppListReplySchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional(),
}).passthrough();

/**
 * Interactive message schema
 */
export const WhatsAppInteractiveSchema = z.object({
  type: z.enum(['button_reply', 'list_reply']),
  button_reply: WhatsAppButtonReplySchema.optional(),
  list_reply: WhatsAppListReplySchema.optional(),
}).passthrough();

// ============================================================================
// Order and Product Schemas
// ============================================================================

/**
 * Product item schema
 */
export const WhatsAppProductItemSchema = z.object({
  product_retailer_id: z.string(),
  quantity: z.string(),
  item_price: z.string(),
  currency: z.string(),
}).passthrough();

/**
 * Order message schema
 */
export const WhatsAppOrderSchema = z.object({
  catalog_id: z.string(),
  text: z.string().optional(),
  product_items: z.array(WhatsAppProductItemSchema),
}).passthrough();

// ============================================================================
// Referral Schema (Ad Click-to-WhatsApp)
// ============================================================================

/**
 * Referral message schema (from ads)
 */
export const WhatsAppReferralSchema = z.object({
  source_url: z.string(),
  source_type: z.string(),
  source_id: z.string(),
  headline: z.string().optional(),
  body: z.string().optional(),
  media_type: z.string().optional(),
  image_url: z.string().optional(),
  video_url: z.string().optional(),
  thumbnail_url: z.string().optional(),
  ctwa_clid: z.string().optional(),
}).passthrough();

// ============================================================================
// System Message Schemas
// ============================================================================

/**
 * System message schema (customer number/profile changes)
 */
export const WhatsAppSystemSchema = z.object({
  body: z.string().optional(),
  identity: z.string().optional(),
  new_wa_id: z.string().optional(),
  wa_id: z.string().optional(),
  type: z.enum(['customer_changed_number', 'customer_identity_changed']).optional(),
  customer: z.string().optional(),
  group_id: z.string().optional(),
}).passthrough();

/**
 * Identity object for system messages
 */
export const WhatsAppIdentitySchema = z.object({
  acknowledged: z.boolean().optional(),
  created_timestamp: z.string().optional(),
  hash: z.string().optional(),
}).passthrough();

// ============================================================================
// Context Schema
// ============================================================================

/**
 * Referred product schema
 */
export const WhatsAppReferredProductSchema = z.object({
  catalog_id: z.string(),
  product_retailer_id: z.string(),
}).passthrough();

/**
 * Context schema for replies
 */
export const WhatsAppContextSchema = z.object({
  forwarded: z.boolean().optional(),
  frequently_forwarded: z.boolean().optional(),
  from: z.string().optional(),
  id: z.string().optional(),
  referred_product: WhatsAppReferredProductSchema.optional(),
}).passthrough();

// ============================================================================
// Error Schema
// ============================================================================

/**
 * Error data schema
 */
export const WhatsAppErrorDataSchema = z.object({
  details: z.string(),
}).passthrough();

/**
 * Error schema
 */
export const WhatsAppErrorSchema = z.object({
  code: z.number(),
  title: z.string(),
  message: z.string().optional(),
  error_data: WhatsAppErrorDataSchema.optional(),
}).passthrough();

// ============================================================================
// Message Schema
// ============================================================================

/**
 * Main message schema supporting all message types
 */
export const WhatsAppMessageSchema = z.object({
  id: z.string(),
  from: z.string(),
  timestamp: z.string(),
  type: z.enum([
    'text',
    'image',
    'video',
    'audio',
    'document',
    'sticker',
    'location',
    'contacts',
    'reaction',
    'button',
    'interactive',
    'order',
    'system',
    'unknown',
  ]),
  // Message content fields (all optional based on type)
  text: WhatsAppTextSchema.optional(),
  image: WhatsAppImageSchema.optional(),
  video: WhatsAppVideoSchema.optional(),
  audio: WhatsAppAudioSchema.optional(),
  document: WhatsAppDocumentSchema.optional(),
  sticker: WhatsAppStickerSchema.optional(),
  location: WhatsAppLocationSchema.optional(),
  contacts: z.array(WhatsAppContactsSchema).optional(),
  reaction: WhatsAppReactionSchema.optional(),
  button: WhatsAppButtonReplySchema.optional(),
  interactive: WhatsAppInteractiveSchema.optional(),
  order: WhatsAppOrderSchema.optional(),
  system: WhatsAppSystemSchema.optional(),
  referral: WhatsAppReferralSchema.optional(),
  // Context and metadata
  context: WhatsAppContextSchema.optional(),
  identity: WhatsAppIdentitySchema.optional(),
  errors: z.array(WhatsAppErrorSchema).optional(),
}).passthrough();

// ============================================================================
// Status Schemas
// ============================================================================

/**
 * Pricing schema for status updates
 */
export const WhatsAppPricingSchema = z.object({
  billable: z.boolean(),
  category: z.string(),
  pricing_model: z.string(),
}).passthrough();

/**
 * Conversation schema for status updates
 */
export const WhatsAppConversationSchema = z.object({
  id: z.string(),
  origin: z.object({
    type: z.string(),
  }).passthrough(),
  expiration_timestamp: z.string().optional(),
}).passthrough();

/**
 * Status update schema
 */
export const WhatsAppStatusSchema = z.object({
  id: z.string(),
  status: z.enum(['sent', 'delivered', 'read', 'failed']),
  timestamp: z.string(),
  recipient_id: z.string(),
  conversation: WhatsAppConversationSchema.optional(),
  pricing: WhatsAppPricingSchema.optional(),
  errors: z.array(WhatsAppErrorSchema).optional(),
  biz_opaque_callback_data: z.string().optional(),
}).passthrough();

// ============================================================================
// Value Schema
// ============================================================================

/**
 * Value object containing the webhook payload data
 */
export const WhatsAppValueSchema = z.object({
  messaging_product: z.string(),
  metadata: WhatsAppMetadataSchema,
  contacts: z.array(WhatsAppContactSchema).optional(),
  messages: z.array(WhatsAppMessageSchema).optional(),
  statuses: z.array(WhatsAppStatusSchema).optional(),
  errors: z.array(WhatsAppErrorSchema).optional(),
}).passthrough();

// ============================================================================
// Change Schema
// ============================================================================

/**
 * Change object schema
 */
export const WhatsAppChangeSchema = z.object({
  field: z.string(),
  value: WhatsAppValueSchema,
}).passthrough();

// ============================================================================
// Entry Schema
// ============================================================================

/**
 * Entry object schema
 */
export const WhatsAppEntrySchema = z.object({
  id: z.string(),
  changes: z.array(WhatsAppChangeSchema),
}).passthrough();

// ============================================================================
// Main Webhook Schema
// ============================================================================

/**
 * Main WhatsApp webhook payload schema
 * This is the top-level schema for all webhook notifications
 */
export const WhatsAppWebhookSchema = z.object({
  object: z.string(),
  entry: z.array(WhatsAppEntrySchema),
}).passthrough();

// ============================================================================
// Type Exports
// ============================================================================

export type WhatsAppWebhook = z.infer<typeof WhatsAppWebhookSchema>;
export type WhatsAppEntry = z.infer<typeof WhatsAppEntrySchema>;
export type WhatsAppChange = z.infer<typeof WhatsAppChangeSchema>;
export type WhatsAppValue = z.infer<typeof WhatsAppValueSchema>;
export type WhatsAppMessage = z.infer<typeof WhatsAppMessageSchema>;
export type WhatsAppStatus = z.infer<typeof WhatsAppStatusSchema>;
export type WhatsAppContact = z.infer<typeof WhatsAppContactSchema>;
export type WhatsAppMetadata = z.infer<typeof WhatsAppMetadataSchema>;
