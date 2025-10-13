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

    // Use ADBMS view for client segment analysis
    const segmentsQuery = `
      SELECT 
        client_segment as segment,
        COUNT(*) as client_count,
        SUM(total_events) as total_events,
        SUM(lifetime_value) as total_spent,
        ROUND(AVG(avg_payment), 2) as avg_event_value,
        MAX(last_event_date) as last_event_date
      FROM v_client_segments
      GROUP BY client_segment
      ORDER BY 
        CASE client_segment COLLATE utf8mb4_unicode_ci
          WHEN 'VIP' THEN 1
          WHEN 'Premium' THEN 2
          WHEN 'Regular' THEN 3
          WHEN 'New' THEN 4
          ELSE 5
        END
    `
    
    const segments = await query(segmentsQuery) as any[]

    // Calculate segment distribution percentages
    const totalClients = segments.reduce((sum: number, s: any) => sum + s.client_count, 0)
    const segmentsWithPercentage = segments.map((s: any) => ({
      ...s,
      percentage: totalClients > 0 ? ((s.client_count / totalClients) * 100).toFixed(1) : 0
    }))

    return {
      success: true,
      data: segmentsWithPercentage
    }

  } catch (error: any) {
    console.error('Client segments error:', error)
    console.error('Error stack:', error.stack)
    console.error('Error message:', error.message)
    
    throw createError({
      statusCode: 500,
      message: error.message || 'Failed to fetch client segments'
    })
  }
})
