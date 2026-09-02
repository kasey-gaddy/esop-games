import { getSupabase, json } from './_supabase.js'

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') return json(405, { error: 'Method not allowed' })

  let body
  try {
    body = JSON.parse(event.body || '{}')
  } catch {
    return json(400, { error: 'Invalid request body' })
  }

  const employeeNumber = String(body.employeeNumber || '').trim()
  const name = String(body.name || '').trim()

  if (!employeeNumber || !name) {
    return json(400, { error: 'Employee number and name are required.' })
  }

  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('employees')
    .select('id, employee_number, name')
    .eq('employee_number', employeeNumber)
    .maybeSingle()

  if (error) return json(500, { error: 'Lookup failed. Please try again.' })

  if (!data || data.name.trim().toLowerCase() !== name.toLowerCase()) {
    return json(401, { error: "We couldn't find a match for that employee number and name. Check your entry and try again." })
  }

  return json(200, { employee: { id: data.id, employeeNumber: data.employee_number, name: data.name } })
}
