import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import {
  DynamoDBDocumentClient,
  PutCommand,
  GetCommand,
  QueryCommand,
  UpdateCommand,
  DeleteCommand,
} from '@aws-sdk/lib-dynamodb'

const client = new DynamoDBClient({ region: process.env.AWS_REGION! })
export const db = DynamoDBDocumentClient.from(client)

// ─── Table name ───────────────────────────────────────────────────────────────
// Single-table design: PK / SK pattern
// PK examples:
//   USER#<userId>         SK: PROFILE
//   USER#<userId>         SK: CALL#<timestamp>#<callId>
//   USER#<userId>         SK: CUSTOMER#<phone>
//   USER#<userId>         SK: APPT#<date>#<id>

const TABLE = process.env.DYNAMODB_TABLE!

// ─── User ─────────────────────────────────────────────────────────────────────
export interface UserProfile {
  userId: string
  email: string
  name: string
  businessName?: string
  createdAt: string
}

export async function putUser(profile: UserProfile) {
  return db.send(new PutCommand({
    TableName: TABLE,
    Item: { PK: `USER#${profile.userId}`, SK: 'PROFILE', ...profile },
    ConditionExpression: 'attribute_not_exists(PK)',
  }))
}

export async function getUser(userId: string) {
  const res = await db.send(new GetCommand({
    TableName: TABLE,
    Key: { PK: `USER#${userId}`, SK: 'PROFILE' },
  }))
  return res.Item as UserProfile | undefined
}

// ─── Calls ────────────────────────────────────────────────────────────────────
export interface CallRecord {
  callId: string
  userId: string
  phone: string
  transcript: string
  summary: string
  duration: number
  status: 'completed' | 'missed' | 'in-progress'
  timestamp: string
}

export async function putCall(call: CallRecord) {
  return db.send(new PutCommand({
    TableName: TABLE,
    Item: {
      PK: `USER#${call.userId}`,
      SK: `CALL#${call.timestamp}#${call.callId}`,
      ...call,
    },
  }))
}

export async function listCalls(userId: string, limit = 20) {
  const res = await db.send(new QueryCommand({
    TableName: TABLE,
    KeyConditionExpression: 'PK = :pk AND begins_with(SK, :prefix)',
    ExpressionAttributeValues: { ':pk': `USER#${userId}`, ':prefix': 'CALL#' },
    ScanIndexForward: false,
    Limit: limit,
  }))
  return (res.Items ?? []) as CallRecord[]
}

// ─── Customers ────────────────────────────────────────────────────────────────
export interface Customer {
  phone: string
  userId: string
  name?: string
  callCount: number
  lastSeen: string
}

export async function upsertCustomer(c: Customer) {
  return db.send(new UpdateCommand({
    TableName: TABLE,
    Key: { PK: `USER#${c.userId}`, SK: `CUSTOMER#${c.phone}` },
    UpdateExpression: 'SET #n = :n, callCount = :cc, lastSeen = :ls',
    ExpressionAttributeNames: { '#n': 'name' },
    ExpressionAttributeValues: { ':n': c.name ?? 'Unknown', ':cc': c.callCount, ':ls': c.lastSeen },
  }))
}

export async function listCustomers(userId: string) {
  const res = await db.send(new QueryCommand({
    TableName: TABLE,
    KeyConditionExpression: 'PK = :pk AND begins_with(SK, :prefix)',
    ExpressionAttributeValues: { ':pk': `USER#${userId}`, ':prefix': 'CUSTOMER#' },
    ScanIndexForward: false,
    Limit: 50,
  }))
  return (res.Items ?? []) as Customer[]
}

// ─── Appointments ─────────────────────────────────────────────────────────────
export interface Appointment {
  apptId: string
  userId: string
  customerPhone: string
  customerName: string
  date: string
  time: string
  status: 'scheduled' | 'confirmed' | 'cancelled'
  createdAt: string
}

export async function putAppointment(appt: Appointment) {
  return db.send(new PutCommand({
    TableName: TABLE,
    Item: {
      PK: `USER#${appt.userId}`,
      SK: `APPT#${appt.date}#${appt.apptId}`,
      ...appt,
    },
  }))
}

export async function listAppointments(userId: string) {
  const res = await db.send(new QueryCommand({
    TableName: TABLE,
    KeyConditionExpression: 'PK = :pk AND begins_with(SK, :prefix)',
    ExpressionAttributeValues: { ':pk': `USER#${userId}`, ':prefix': 'APPT#' },
    ScanIndexForward: false,
    Limit: 50,
  }))
  return (res.Items ?? []) as Appointment[]
}

export async function deleteAppointment(userId: string, date: string, apptId: string) {
  return db.send(new DeleteCommand({
    TableName: TABLE,
    Key: { PK: `USER#${userId}`, SK: `APPT#${date}#${apptId}` },
  }))
}

// ─── Business Config ───────────────────────────────────────────────────────────
export interface BusinessConfig {
  userId: string
  type: string
  name: string
  phone?: string
  address?: string
  hours: Record<string, { open: string; close: string; closed?: boolean }>
  services: string[]
  tone: 'professional' | 'friendly' | 'casual'
  language: string
  twilioNumber?: string
  twilioSid?: string
  elevenLabsVoiceId?: string
  elevenLabsVoiceName?: string
  onboardingComplete: boolean
  updatedAt: string
}

export async function putBusinessConfig(config: BusinessConfig) {
  return db.send(new PutCommand({
    TableName: TABLE,
    Item: { PK: `USER#${config.userId}`, SK: 'BUSINESS', ...config },
  }))
}

export async function getBusinessConfig(userId: string) {
  const res = await db.send(new GetCommand({
    TableName: TABLE,
    Key: { PK: `USER#${userId}`, SK: 'BUSINESS' },
  }))
  return res.Item as BusinessConfig | undefined
}

// ─── Knowledge Base ────────────────────────────────────────────────────────────
export interface KnowledgeEntry {
  knowledgeId: string
  userId: string
  title: string
  content: string
  type: 'faq' | 'policy' | 'service' | 'general'
  createdAt: string
}

export async function putKnowledge(entry: KnowledgeEntry) {
  return db.send(new PutCommand({
    TableName: TABLE,
    Item: { PK: `USER#${entry.userId}`, SK: `KNOWLEDGE#${entry.knowledgeId}`, ...entry },
  }))
}

export async function listKnowledge(userId: string) {
  const res = await db.send(new QueryCommand({
    TableName: TABLE,
    KeyConditionExpression: 'PK = :pk AND begins_with(SK, :prefix)',
    ExpressionAttributeValues: { ':pk': `USER#${userId}`, ':prefix': 'KNOWLEDGE#' },
  }))
  return (res.Items ?? []) as KnowledgeEntry[]
}

export async function deleteKnowledge(userId: string, knowledgeId: string) {
  return db.send(new DeleteCommand({
    TableName: TABLE,
    Key: { PK: `USER#${userId}`, SK: `KNOWLEDGE#${knowledgeId}` },
  }))
}

// ─── Active Call Conversation ──────────────────────────────────────────────────
export interface ConvTurn {
  callSid: string
  userId: string
  role: 'user' | 'assistant'
  content: string
  seq: number
  ts: string
}

export async function appendConvTurn(turn: ConvTurn) {
  return db.send(new PutCommand({
    TableName: TABLE,
    Item: {
      PK: `CALL#${turn.callSid}`,
      SK: `TURN#${String(turn.seq).padStart(4, '0')}`,
      TTL: Math.floor(Date.now() / 1000) + 86400, // 24h TTL
      ...turn,
    },
  }))
}

export async function getConvHistory(callSid: string) {
  const res = await db.send(new QueryCommand({
    TableName: TABLE,
    KeyConditionExpression: 'PK = :pk',
    ExpressionAttributeValues: { ':pk': `CALL#${callSid}` },
    ScanIndexForward: true,
  }))
  return (res.Items ?? []) as ConvTurn[]
}

// ─── Customer update helper ────────────────────────────────────────────────────
export async function deleteCustomer(userId: string, phone: string) {
  return db.send(new DeleteCommand({
    TableName: TABLE,
    Key: { PK: `USER#${userId}`, SK: `CUSTOMER#${phone}` },
  }))
}
