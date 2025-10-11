import { query } from '../../db/connection'

export default defineEventHandler(async (event) => {
  try {
    const user = event.context.user
    const queryParams = getQuery(event)
    const eventId = queryParams.event_id

    // Build query based on filters
    let sql = `
      SELECT 
        p.*,
        e.event_name,
        u.full_name as client_name
      FROM payments p
      LEFT JOIN events e ON p.event_id = e.event_id
      LEFT JOIN users u ON e.client_id = u.user_id
    `
    
    const params: any[] = []
    const conditions: string[] = []

    // Filter by event if specified
    if (eventId) {
      conditions.push('p.event_id = ?')
      params.push(eventId)
    }

    // If user is a client, show only their payments
    if (user.role === 'client') {
      conditions.push('e.client_id = ?')
      params.push(user.userId)
    }

    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ')
    }

    sql += ' ORDER BY p.payment_date DESC'

    const payments = await query(sql, params)

    return {
      success: true,
      data: payments
    }

  } catch (error: any) {
    console.error('Get payments error:', error)
    
    throw createError({
      statusCode: 500,
      message: 'Failed to fetch payments'
    })
  }
})
