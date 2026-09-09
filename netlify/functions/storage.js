import { getStore } from '@netlify/blobs'

function getBlobStore() {
  const siteID = process.env.NETLIFY_SITE_ID
  const token = process.env.NETLIFY_AUTH_TOKEN
  if (!siteID || !token) {
    throw new Error('Missing NETLIFY_SITE_ID or NETLIFY_AUTH_TOKEN environment variables.')
  }
  return getStore({ name: 'esop-games', siteID, token })
}

const ADMIN_PREFIXES = ['games:', 'questions:', 'employees:']

function isProtected(key) {
  return ADMIN_PREFIXES.some((p) => key.startsWith(p))
}

function json(status, body) {
  return { statusCode: status, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }
}

function requireAdmin(key, pw) {
  const expected = process.env.ADMIN_PASSWORD
  if (!isProtected(key)) return null // not a protected key, no check needed
  if (!expected) return json(500, { error: 'ADMIN_PASSWORD is not configured on the server.' })
  if (pw !== expected) return json(401, { error: 'Admin password required for this action.' })
  return null // ok
}

export const handler = async (event) => {
  const params = event.queryStringParameters || {}
  const { op, key, prefix, pw } = params

  let store
  try {
    store = getBlobStore()
  } catch (err) {
    return json(500, { error: err.message || 'Could not reach storage.' })
  }

  try {
    if (op === 'auth') {
      const expected = process.env.ADMIN_PASSWORD
      return json(200, { ok: !!expected && pw === expected })
    }

    if (op === 'get') {
      if (!key) return json(400, { error: 'key is required' })
      const value = await store.get(key, { type: 'json' })
      return json(200, { value: value ?? null })
    }

    if (op === 'list') {
      const { blobs } = await store.list({ prefix: prefix || '' })
      return json(200, { keys: blobs.map((b) => b.key) })
    }

    if (op === 'set') {
      if (!key) return json(400, { error: 'key is required' })
      const denied = requireAdmin(key, pw)
      if (denied) return denied
      const body = JSON.parse(event.body || '{}')
      await store.setJSON(key, body.value)
      return json(200, { ok: true })
    }

    if (op === 'delete') {
      if (!key) return json(400, { error: 'key is required' })
      const denied = requireAdmin(key, pw)
      if (denied) return denied
      await store.delete(key)
      return json(200, { ok: true })
    }

    return json(400, { error: `Unknown op: ${op}` })
  } catch (err) {
    return json(500, { error: err.message || 'Storage error.' })
  }
}
