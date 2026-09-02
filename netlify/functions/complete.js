import { getSupabase, json } from './_supabase.js'

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') return json(405, { error: 'Method not allowed' })

  let body
  try {
    body = JSON.parse(event.body || '{}')
  } catch {
    return json(400, { error: 'Invalid request body' })
  }

  const { employeeId, gameId, score } = body
  if (!employeeId || !gameId) return json(400, { error: 'employeeId and gameId are required.' })

  const supabase = getSupabase()

  const { error } = await supabase
    .from('completions')
    .upsert(
      { employee_id: employeeId, game_id: gameId, score: score ?? null, completed_at: new Date().toISOString() },
      { onConflict: 'employee_id,game_id' }
    )

  if (error) return json(500, { error: 'Could not save your completion. Please try again.' })

  return json(200, { ok: true })
}
