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

    // Use ADBMS view for service profitability analysis
    const profitabilityQuery = `
      SELECT 
        service_name,
        bookings as total_bookings,
        revenue as total_revenue,
        estimated_cost,
        estimated_total_profit as estimated_profit,
        profit_margin_pct
      FROM v_service_profitability
      WHERE bookings > 0
      ORDER BY profit_margin_pct DESC
    `
    
    const profitability = await query(profitabilityQuery) as any[]

    return {
      success: true,
      data: profitability
    }

  } catch (error: any) {
    console.error('Service profitability error:', error)
    
    throw createError({
      statusCode: 500,
      message: 'Failed to fetch service profitability report'
    })
  }
})
