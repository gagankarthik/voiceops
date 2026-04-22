import twilio from 'twilio'

export const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID!,
  process.env.TWILIO_AUTH_TOKEN!
)

export function twiml() {
  return new twilio.twiml.VoiceResponse()
}

export async function listAvailableNumbers(areaCode?: string) {
  const opts = areaCode ? { areaCode: parseInt(areaCode, 10) } : {}
  const numbers = await twilioClient.availablePhoneNumbers('US').local.list({ ...opts, limit: 10 })
  return numbers.map(n => ({ phoneNumber: n.phoneNumber, friendlyName: n.friendlyName }))
}

export async function provisionNumber(phoneNumber: string, webhookBase: string) {
  const incoming = await twilioClient.incomingPhoneNumbers.create({
    phoneNumber,
    voiceUrl: `${webhookBase}/api/twilio/incoming`,
    voiceMethod: 'POST',
  })
  return { sid: incoming.sid, phoneNumber: incoming.phoneNumber }
}

export async function updateNumberWebhook(sid: string, webhookBase: string) {
  return twilioClient.incomingPhoneNumbers(sid).update({
    voiceUrl: `${webhookBase}/api/twilio/incoming`,
    voiceMethod: 'POST',
  })
}

export async function makeOutboundCall(to: string, from: string, twimlUrl: string) {
  return twilioClient.calls.create({
    to,
    from,
    url: twimlUrl,
    method: 'POST',
  })
}
