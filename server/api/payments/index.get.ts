import { query } from '../../db/connection'

export default defineEventHandler(async (event) => {
  try {
    const user = event.context.user
    const queryParams = getQuery(event)
    const eventId = queryParams.event_id

    // Use ADBMS view v_payment_summary for optimized query
    let sql = `SELECT * FROM v_payment_summary WHERE 1=1`
    
    const params: any[] = []

    // Filter by event if specified
    if (eventId) {
      sql += ' AND event_id = ?'
      params.push(eventId)
    }

    // If user is a client, show only their payments
    // Note: v_payment_summary already has client_name joined
    if (user.role === 'client') {
      // Need to join back to get client_id for filtering
      sql = `
        SELECT v.* 
        FROM v_payment_summary v
        JOIN events e ON v.event_id = e.event_id
        WHERE e.client_id = ?
      `
      params.unshift(user.userId)
      
      if (eventId) {
        sql += ' AND v.event_id = ?'
        params.push(eventId)
      }
    }

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
