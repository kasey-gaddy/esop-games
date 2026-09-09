import { getStore } from '@netlify/blobs'

function getBlobStore() {
  const siteID = process.env.NETLIFY_SITE_ID
  const token = process.env.NETLIFY_AUTH_TOKEN
  if (!siteID || !token) {
    throw new Error('Missing NETLIFY_SITE_ID or NETLIFY_AUTH_TOKEN environment variables.')
  }
  return getStore({ name: 'esop-games', siteID, token })
}

function json(status, body) {
  return { statusCode: status, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }
}

export const handler = async (event) => {
  const params = event.queryStringParameters || {}
  const pw = params.pw
  const expected = process.env.ADMIN_PASSWORD

  if (!expected) return json(500, { error: 'ADMIN_PASSWORD is not configured on the server.' })
  if (pw !== expected) return json(401, { error: 'Incorrect admin password.' })

  try {
    const store = getBlobStore()

    const employees = (await store.get('employees:list', { type: 'json' })) || []
    const games = (await store.get('games:list', { type: 'json' })) || []

    const { blobs } = await store.list({ prefix: 'completions:' })
    const completions = (
      await Promise.all(blobs.map((b) => store.get(b.key, { type: 'json' })))
    ).filter(Boolean)

    return json(200, { employees, games, completions })
  } catch (err) {
    return json(500, { error: err.message || 'Could not build the report.' })
  }
}
