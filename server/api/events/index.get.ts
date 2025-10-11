import { query } from '../../db/connection'

export default defineEventHandler(async (event) => {
  try {
    const user = event.context.user

    // Build query based on user role
    let sql = `
      SELECT 
        e.*,
        et.type_name,
        u.full_name as client_name,
        u.email as client_email
      FROM events e
      LEFT JOIN event_types et ON e.event_type_id = et.event_type_id
      LEFT JOIN users u ON e.client_id = u.user_id
    `
    
    const params: any[] = []

    // If user is a client, show only their events
    if (user.role === 'client') {
      sql += ' WHERE e.client_id = ?'
      params.push(user.userId)
    }

    sql += ' ORDER BY e.event_date DESC, e.created_at DESC'

    const events = await query(sql, params)

    return {
      success: true,
      data: events
    }

  } catch (error: any) {
    console.error('Get events error:', error)
    
    throw createError({
      statusCode: 500,
      message: 'Failed to fetch events'
    })
  }
})
