import { getSupabase, json } from './_supabase.js'

export const handler = async (event) => {
  if (event.httpMethod !== 'GET') return json(405, { error: 'Method not allowed' })

  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('games')
    .select('id, sheet_label, title, description, type, is_unlocked, sort_order')
    .order('sort_order', { ascending: true })

  if (error) return json(500, { error: 'Could not load games.' })

  const employeeId = event.queryStringParameters && event.queryStringParameters.employeeId
  let completedIds = []
  if (employeeId) {
    const { data: completions } = await supabase
      .from('completions')
      .select('game_id')
      .eq('employee_id', employeeId)
    completedIds = (completions || []).map(c => c.game_id)
  }

  return json(200, { games: data, completedIds })
}
