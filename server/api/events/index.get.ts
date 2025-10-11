import { query } from '../../db/connection'

export default defineEventHandler(async (event) => {
  try {
    const user = event.context.user
    const { status, search, startDate, endDate } = getQuery(event)

    // Use v_event_summary view for comprehensive data with calculated fields
    let sql = `
      SELECT 
        vs.*,
        fn_payment_status(vs.event_id) as payment_status,
        fn_days_until_event(vs.event_id) as days_until_event,
        e.client_id,
        e.created_at
      FROM v_event_summary vs
      JOIN events e ON vs.event_id = e.event_id
      WHERE 1=1
    `
    
    const params: any[] = []

    // If user is a client, show only their events
    if (user.role === 'client') {
      sql += ' AND e.client_id = ?'
      params.push(user.userId)
    }

    // Filter by status
    if (status && status !== 'all') {
      sql += ' AND vs.status = ?'
      params.push(status)
    }

    // Search by event name or client name
    if (search) {
      sql += ' AND (vs.event_name LIKE ? OR vs.client_name LIKE ?)'
      params.push(`%${search}%`, `%${search}%`)
    }

    // Filter by date range
    if (startDate) {
      sql += ' AND vs.event_date >= ?'
      params.push(startDate)
    }

    if (endDate) {
      sql += ' AND vs.event_date <= ?'
      params.push(endDate)
    }

    sql += ' ORDER BY vs.event_date DESC, e.created_at DESC'

    const events = await query(sql, params)

    // Calculate additional stats
    const statsQuery = `
      SELECT 
        COUNT(*) as total_count,
        SUM(CASE WHEN status = 'inquiry' THEN 1 ELSE 0 END) as inquiry,
        SUM(CASE WHEN status = 'confirmed' THEN 1 ELSE 0 END) as confirmed,
        SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as in_progress,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
        SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled
      FROM events
      ${user.role === 'client' ? 'WHERE client_id = ?' : ''}
    `
    
    const stats = await query(statsQuery, user.role === 'client' ? [user.userId] : [])

    return {
      success: true,
      data: events,
      stats: Array.isArray(stats) ? stats[0] : stats
    }

  } catch (error: any) {
    console.error('Get events error:', error)
    
    throw createError({
      statusCode: 500,
      message: 'Failed to fetch events'
    })
  }
})
