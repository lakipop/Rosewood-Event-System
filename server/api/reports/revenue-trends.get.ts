import { query } from '../../db/connection'

export default defineEventHandler(async (event) => {
  try {
    // Authentication check
    if (!event.context.user) {
      throw createError({
        statusCode: 401,
        message: 'Unauthorized'
      })
    }

    // Get query parameters
    const queryParams = getQuery(event)
    const months = parseInt(queryParams.months as string) || 12

    // Use ADBMS view for revenue trends analysis
    // Note: Using template literal for LIMIT because window functions don't work well with prepared statements
    const trendsQuery = `
      SELECT 
        month,
        monthly_revenue as total_revenue,
        events_count as total_events,
        avg_transaction as avg_event_revenue,
        growth_pct as growth_rate
      FROM v_revenue_trends
      ORDER BY month DESC
      LIMIT ${months}
    `
    
    const trends = await query(trendsQuery) as any[]

    return {
      success: true,
      data: trends
    }

  } catch (error: any) {
    console.error('Revenue trends error:', error)
    console.error('Error stack:', error.stack)
    console.error('Error message:', error.message)
    
    throw createError({
      statusCode: 500,
      message: error.message || 'Failed to fetch revenue trends'
    })
  }
})
