import { getSupabase, json } from './_supabase.js'

export const handler = async (event) => {
  if (event.httpMethod !== 'GET') return json(405, { error: 'Method not allowed' })

  const gameId = event.queryStringParameters && event.queryStringParameters.gameId
  if (!gameId) return json(400, { error: 'gameId is required' })

  const supabase = getSupabase()

  const { data: game, error: gameError } = await supabase
    .from('games')
    .select('id, is_unlocked, type, title')
    .eq('id', gameId)
    .maybeSingle()

  if (gameError || !game) return json(404, { error: 'Game not found.' })
  if (!game.is_unlocked) return json(403, { error: 'This game is not unlocked yet.' })

  const { data: questions, error } = await supabase
    .from('questions')
    .select('id, order_index, payload')
    .eq('game_id', gameId)
    .order('order_index', { ascending: true })

  if (error) return json(500, { error: 'Could not load questions.' })

  return json(200, { game, questions })
}
