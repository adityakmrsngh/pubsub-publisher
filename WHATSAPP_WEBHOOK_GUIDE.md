# WhatsApp Webhook Implementation Guide

## Overview

This service implements a production-ready WhatsApp Cloud API v23.0 webhook receiver that validates and publishes all message types to Google Cloud Pub/Sub.

## Supported Message Types

The webhook now supports **ALL** WhatsApp message types:

### Media Messages
- ✅ **Text** - Plain text messages
- ✅ **Image** - Image messages with optional captions
- ✅ **Video** - Video messages with optional captions
- ✅ **Audio** - Audio messages including voice notes
- ✅ **Document** - Document files (PDF, DOCX, etc.)
- ✅ **Sticker** - Stickers (animated and static)

### Interactive Messages
- ✅ **Location** - Location sharing with coordinates
- ✅ **Contacts** - Contact card sharing
- ✅ **Reaction** - Message reactions (emojis)
- ✅ **Button** - Button reply interactions
- ✅ **Interactive** - List and button replies
- ✅ **Order** - Product orders from catalog

### System Messages
- ✅ **System** - Customer profile/number changes
- ✅ **Referral** - Ad click-to-WhatsApp messages
- ✅ **Unknown** - Fallback for future message types

### Status Updates
- ✅ **Sent** - Message sent confirmation
- ✅ **Delivered** - Message delivered to recipient
- ✅ **Read** - Message read by recipient
- ✅ **Failed** - Message delivery failure

## Architecture

```
WhatsApp Cloud API
        ↓
   Webhook POST
        ↓
  Zod Validation (All message types)
        ↓
  Google Cloud Pub/Sub
        ↓
  Your Consumer Service
```

## Key Features

### 1. Comprehensive Validation
- All WhatsApp API v23.0 message types supported
- Flexible schema with `.passthrough()` for forward compatibility
- Optional fields properly handled
- Detailed error logging with payload inspection

### 2. Production-Ready Error Handling
- Enhanced error logging with Zod error details
- Payload logging for debugging (configurable via LOG_LEVEL)
- Graceful handling of unknown fields
- Proper HTTP status codes

### 3. Type Safety
- Full TypeScript support
- Exported types for all schemas
- Type-safe message handling

### 4. Scalability
- Modular schema architecture
- Easy to extend for new message types
- Separation of concerns (schemas, handlers, logging)

## Configuration

### Environment Variables

```bash
# Required
WEBHOOK_VERIFY_TOKEN=your_webhook_verify_token
TOPIC_ID=your_pubsub_topic_id

# Optional
PROJECT_ID=your_gcp_project_id  # Auto-detected in Cloud Run
PORT=8080
LOG_LEVEL=info  # debug, info, warn, error
NODE_ENV=production
```

### Example .env file

```bash
WEBHOOK_VERIFY_TOKEN=my_secure_token_123
TOPIC_ID=whatsapp-events
PROJECT_ID=my-gcp-project
LOG_LEVEL=info
PORT=8080
```

## API Endpoints

### GET /webhook
**Purpose**: WhatsApp webhook verification

**Query Parameters**:
- `hub.mode` - Should be "subscribe"
- `hub.verify_token` - Your verification token
- `hub.challenge` - Challenge string to echo back

**Response**: Returns the challenge string if verification succeeds

### POST /webhook
**Purpose**: Receive WhatsApp webhook events

**Request Body**: WhatsApp webhook payload (see examples below)

**Response**:
- `202 Accepted` - Message published successfully
- `400 Bad Request` - Invalid payload
- `500 Internal Server Error` - Pub/Sub publishing error

### GET /healthz
**Purpose**: Health check endpoint

**Response**: `200 OK` with "ok" text

## Webhook Payload Examples

### Text Message
```json
{
  "object": "whatsapp_business_account",
  "entry": [{
    "id": "BUSINESS_ACCOUNT_ID",
    "changes": [{
      "value": {
        "messaging_product": "whatsapp",
        "metadata": {
          "display_phone_number": "15551234567",
          "phone_number_id": "123456789"
        },
        "contacts": [{
          "profile": { "name": "John Doe" },
          "wa_id": "15559876543"
        }],
        "messages": [{
          "from": "15559876543",
          "id": "wamid.XXX",
          "timestamp": "1234567890",
          "type": "text",
          "text": { "body": "Hello!" }
        }]
      },
      "field": "messages"
    }]
  }]
}
```

### Image Message
```json
{
  "object": "whatsapp_business_account",
  "entry": [{
    "id": "BUSINESS_ACCOUNT_ID",
    "changes": [{
      "value": {
        "messaging_product": "whatsapp",
        "metadata": {
          "display_phone_number": "15551234567",
          "phone_number_id": "123456789"
        },
        "contacts": [{
          "profile": { "name": "John Doe" },
          "wa_id": "15559876543"
        }],
        "messages": [{
          "from": "15559876543",
          "id": "wamid.XXX",
          "timestamp": "1234567890",
          "type": "image",
          "image": {
            "id": "IMAGE_ID",
            "mime_type": "image/jpeg",
            "sha256": "HASH",
            "caption": "Check this out!"
          }
        }]
      },
      "field": "messages"
    }]
  }]
}
```

### Audio/Voice Message
```json
{
  "object": "whatsapp_business_account",
  "entry": [{
    "id": "BUSINESS_ACCOUNT_ID",
    "changes": [{
      "value": {
        "messaging_product": "whatsapp",
        "metadata": {
          "display_phone_number": "15551234567",
          "phone_number_id": "123456789"
        },
        "messages": [{
          "from": "15559876543",
          "id": "wamid.XXX",
          "timestamp": "1234567890",
          "type": "audio",
          "audio": {
            "id": "AUDIO_ID",
            "mime_type": "audio/ogg; codecs=opus"
          }
        }]
      },
      "field": "messages"
    }]
  }]
}
```

### Location Message
```json
{
  "object": "whatsapp_business_account",
  "entry": [{
    "id": "BUSINESS_ACCOUNT_ID",
    "changes": [{
      "value": {
        "messaging_product": "whatsapp",
        "metadata": {
          "display_phone_number": "15551234567",
          "phone_number_id": "123456789"
        },
        "messages": [{
          "from": "15559876543",
          "id": "wamid.XXX",
          "timestamp": "1234567890",
          "type": "location",
          "location": {
            "latitude": 37.7749,
            "longitude": -122.4194,
            "name": "San Francisco",
            "address": "San Francisco, CA"
          }
        }]
      },
      "field": "messages"
    }]
  }]
}
```

### Status Update (Delivered)
```json
{
  "object": "whatsapp_business_account",
  "entry": [{
    "id": "BUSINESS_ACCOUNT_ID",
    "changes": [{
      "value": {
        "messaging_product": "whatsapp",
        "metadata": {
          "display_phone_number": "15551234567",
          "phone_number_id": "123456789"
        },
        "statuses": [{
          "id": "wamid.XXX",
          "status": "delivered",
          "timestamp": "1234567890",
          "recipient_id": "15559876543",
          "conversation": {
            "id": "CONVERSATION_ID",
            "origin": { "type": "service" }
          },
          "pricing": {
            "billable": true,
            "pricing_model": "CBP",
            "category": "service"
          }
        }]
      },
      "field": "messages"
    }]
  }]
}
```

## Debugging

### Enable Debug Logging

Set `LOG_LEVEL=debug` in your environment to see detailed webhook payloads:

```bash
LOG_LEVEL=debug npm run dev
```

### Common Issues

#### 1. "Body inválido" Error
**Cause**: Webhook payload doesn't match expected schema

**Solution**: Check logs for detailed Zod validation errors:
```json
{
  "error": { ... },
  "zodErrors": [ ... ],
  "receivedPayload": { ... },
  "payloadKeys": [ ... ]
}
```

#### 2. Missing Message Types
**Cause**: Old schema didn't support all message types

**Solution**: ✅ Fixed! All message types now supported

#### 3. Optional Fields Causing Errors
**Cause**: Schema required fields that WhatsApp doesn't always send

**Solution**: ✅ Fixed! All optional fields properly marked with `.optional()`

## Testing

### Test with cURL

```bash
# Test webhook verification
curl "http://localhost:8080/webhook?hub.mode=subscribe&hub.verify_token=your_token&hub.challenge=test123"

# Test text message webhook
curl -X POST http://localhost:8080/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "object": "whatsapp_business_account",
    "entry": [{
      "id": "123",
      "changes": [{
        "value": {
          "messaging_product": "whatsapp",
          "metadata": {
            "display_phone_number": "15551234567",
            "phone_number_id": "123456789"
          },
          "messages": [{
            "from": "15559876543",
            "id": "wamid.XXX",
            "timestamp": "1234567890",
            "type": "text",
            "text": { "body": "Test message" }
          }]
        },
        "field": "messages"
      }]
    }]
  }'
```

## Deployment

### Docker

```bash
# Build
docker build -t whatsapp-webhook .

# Run
docker run -p 8080:8080 \
  -e WEBHOOK_VERIFY_TOKEN=your_token \
  -e TOPIC_ID=whatsapp-events \
  -e PROJECT_ID=your-project \
  whatsapp-webhook
```

### Google Cloud Run

```bash
gcloud run deploy whatsapp-webhook \
  --source . \
  --region us-central1 \
  --set-env-vars WEBHOOK_VERIFY_TOKEN=your_token,TOPIC_ID=whatsapp-events \
  --allow-unauthenticated
```

## Schema Architecture

The validation schemas are organized in `src/schemas/whatsapp.schema.ts`:

```
whatsapp.schema.ts
├── Base Schemas (Contact, Metadata)
├── Media Schemas (Image, Video, Audio, Document, Sticker)
├── Message Content Schemas (Text, Location, Contacts, Reaction)
├── Interactive Schemas (Button, List)
├── Order Schemas (Product, Order)
├── Referral Schema (Ads)
├── System Schemas (Profile/Number changes)
├── Context Schema (Replies)
├── Error Schema
├── Message Schema (Main)
├── Status Schemas (Pricing, Conversation, Status)
├── Value Schema
├── Change Schema
├── Entry Schema
└── Webhook Schema (Top-level)
```

## Best Practices

1. **Always validate environment variables** on startup
2. **Use structured logging** with context (Pino)
3. **Handle all message types** gracefully
4. **Log validation failures** with full payload for debugging
5. **Use `.passthrough()`** for forward compatibility
6. **Keep schemas modular** and well-documented
7. **Export TypeScript types** for type safety
8. **Monitor Pub/Sub** publishing success/failure rates

## References

- [WhatsApp Cloud API Documentation](https://developers.facebook.com/docs/whatsapp/cloud-api)
- [Webhook Components Reference](https://developers.facebook.com/docs/whatsapp/cloud-api/webhooks/components)
- [WhatsApp API Changelog](https://developers.facebook.com/docs/whatsapp/business-platform/changelog)

## Support

For issues or questions:
1. Check logs with `LOG_LEVEL=debug`
2. Verify webhook payload matches examples above
3. Ensure all environment variables are set
4. Check WhatsApp API version compatibility (v23.0)
