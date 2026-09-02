import { getSupabase, json, checkAdmin } from './_supabase.js'

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') return json(405, { error: 'Method not allowed' })

  let body
  try {
    body = JSON.parse(event.body || '{}')
  } catch {
    return json(400, { error: 'Invalid request body' })
  }

  if (!checkAdmin(body)) return json(401, { error: 'Incorrect admin password.' })

  const supabase = getSupabase()
  const { action } = body

  try {
    switch (action) {
      case 'listEmployees': {
        const { data, error } = await supabase
          .from('employees')
          .select('id, employee_number, name, created_at')
          .order('created_at', { ascending: false })
        if (error) throw error
        return json(200, { employees: data })
      }

      case 'bulkUploadEmployees': {
        const rows = Array.isArray(body.employees) ? body.employees : []
        const clean = rows
          .map(r => ({
            employee_number: String(r.employeeNumber ?? r.employee_number ?? '').trim(),
            name: String(r.name ?? '').trim()
          }))
          .filter(r => r.employee_number && r.name)

        if (clean.length === 0) return json(400, { error: 'No valid rows found. Each row needs an employee number and a name.' })

        const { data, error } = await supabase
          .from('employees')
          .upsert(clean, { onConflict: 'employee_number' })
          .select('id')
        if (error) throw error
        return json(200, { inserted: data.length })
      }

      case 'deleteEmployee': {
        const { error } = await supabase.from('employees').delete().eq('id', body.id)
        if (error) throw error
        return json(200, { ok: true })
      }

      case 'toggleGame': {
        const { error } = await supabase
          .from('games')
          .update({ is_unlocked: !!body.isUnlocked, updated_at: new Date().toISOString() })
          .eq('id', body.gameId)
        if (error) throw error
        return json(200, { ok: true })
      }

      case 'listQuestions': {
        const { data, error } = await supabase
          .from('questions')
          .select('id, order_index, payload')
          .eq('game_id', body.gameId)
          .order('order_index', { ascending: true })
        if (error) throw error
        return json(200, { questions: data })
      }

      case 'upsertQuestion': {
        if (!body.gameId || !body.payload) return json(400, { error: 'gameId and payload are required.' })
        const row = {
          game_id: body.gameId,
          order_index: body.orderIndex ?? 0,
          payload: body.payload
        }
        if (body.id) row.id = body.id
        const { data, error } = await supabase.from('questions').upsert(row).select('id').single()
        if (error) throw error
        return json(200, { id: data.id })
      }

      case 'deleteQuestion': {
        const { error } = await supabase.from('questions').delete().eq('id', body.id)
        if (error) throw error
        return json(200, { ok: true })
      }

      case 'completionsReport': {
        const { data: employees, error: eErr } = await supabase.from('employees').select('id, employee_number, name')
        if (eErr) throw eErr
        const { data: games, error: gErr } = await supabase.from('games').select('id, title, sheet_label').order('sort_order')
        if (gErr) throw gErr
        const { data: completions, error: cErr } = await supabase.from('completions').select('employee_id, game_id, score, completed_at')
        if (cErr) throw cErr
        return json(200, { employees, games, completions })
      }

      default:
        return json(400, { error: `Unknown action: ${action}` })
    }
  } catch (err) {
    return json(500, { error: err.message || 'Something went wrong.' })
  }
}
