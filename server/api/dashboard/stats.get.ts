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
    
    const user = event.context.user

    // Get total events count
    const totalEventsQuery = 'SELECT COUNT(*) as count FROM events'
    const totalEvents = await query(totalEventsQuery) as any[]

    // Get upcoming events (next 30 days) using ADBMS view
    const upcomingEventsQuery = 'SELECT COUNT(*) as count FROM v_upcoming_events'
    const upcomingEvents = await query(upcomingEventsQuery) as any[]

    // Get monthly revenue using ADBMS view
    const monthlyRevenueQuery = `
      SELECT 
        total_revenue,
        total_transactions,
        avg_transaction
      FROM v_monthly_revenue 
      WHERE month = DATE_FORMAT(CURDATE(), '%Y-%m')
    `
    const monthlyRevenue = await query(monthlyRevenueQuery) as any[]

    // Get events by status count
    const statusCountQuery = `
      SELECT 
        status,
        COUNT(*) as count
      FROM events
      GROUP BY status
    `
    const statusCounts = await query(statusCountQuery) as any[]

    // Get recent events using v_event_summary
    const recentEventsQuery = `
      SELECT 
        event_id,
        event_name,
        event_date,
        venue,
        status,
        client_name,
        total_cost,
        total_paid,
        balance,
        fn_payment_status(event_id) as payment_status
      FROM v_event_summary 
      ORDER BY created_at DESC 
      LIMIT 5
    `
    const recentEvents = await query(recentEventsQuery) as any[]

    // Get payment stats (this month)
    const paymentStatsQuery = `
      SELECT 
        COUNT(*) as payment_count,
        SUM(amount) as total_amount
      FROM payments
      WHERE MONTH(payment_date) = MONTH(CURDATE())
        AND YEAR(payment_date) = YEAR(CURDATE())
        AND status = 'completed'
    `
    const paymentStats = await query(paymentStatsQuery) as any[]

    // Get top services using v_service_stats view
    const topServicesQuery = `
      SELECT 
        service_name,
        total_bookings,
        total_revenue,
        avg_price
      FROM v_service_stats
      ORDER BY total_revenue DESC
      LIMIT 5
    `
    const topServices = await query(topServicesQuery) as any[]

    return {
      success: true,
      data: {
        stats: {
          totalEvents: totalEvents[0]?.count || 0,
          upcomingEvents: upcomingEvents[0]?.count || 0,
          monthlyRevenue: monthlyRevenue[0]?.total_revenue || 0,
          monthlyTransactions: monthlyRevenue[0]?.total_transactions || 0,
          avgTransaction: monthlyRevenue[0]?.avg_transaction || 0,
          paymentsThisMonth: paymentStats[0]?.payment_count || 0,
          paymentsAmount: paymentStats[0]?.total_amount || 0
        },
        statusCounts: statusCounts.map((s: any) => ({
          status: s.status,
          count: s.count
        })),
        recentEvents,
        topServices
      }
    }

  } catch (error: any) {
    console.error('Dashboard stats error:', error)
    
    throw createError({
      statusCode: 500,
      message: 'Failed to fetch dashboard statistics'
    })
  }
})
