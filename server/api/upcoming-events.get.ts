import { getPool } from '../db/connection'

export default defineEventHandler(async (event) => {
  const queryParams = getQuery(event)
  const days = parseInt(queryParams.days as string) || 7

  try {
    const pool = getPool()
    
    const [events] = await pool.query(`
      SELECT 
        event_id,
        event_name,
        event_date,
        event_time,
        venue,
        status,
        client_name,
        days_until,
        payment_status
      FROM v_upcoming_events
      WHERE days_until <= ?
      ORDER BY days_until ASC, event_date ASC
      LIMIT 10
    `, [days])

    return {
      success: true,
      data: events
    }
  } catch (error: any) {
    console.error('Database error in upcoming-events:', error)
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      sqlMessage: error.sqlMessage
    })
    throw createError({
      statusCode: 500,
      message: 'Failed to fetch upcoming events',
      data: { error: error.message }
    })
  }
})
