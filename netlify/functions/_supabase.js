import { createClient } from '@supabase/supabase-js'

let client = null

export function getSupabase() {
  if (client) return client
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables')
  }
  client = createClient(url, key, { auth: { persistSession: false } })
  return client
}

export function json(status, body) {
  return {
    statusCode: status,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  }
}

export function checkAdmin(payload) {
  const expected = process.env.ADMIN_PASSWORD
  if (!expected) throw new Error('ADMIN_PASSWORD environment variable is not set')
  return payload && payload.adminPassword === expected
}
