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

    // Get query parameters
    const queryParams = getQuery(event)
    const year = parseInt(queryParams.year as string) || new Date().getFullYear()
    const month = parseInt(queryParams.month as string) || new Date().getMonth() + 1

    // Use ADBMS procedure for monthly financial report
    const reportQuery = `CALL sp_monthly_financial_report(?, ?)`
    const result = await query(reportQuery, [year, month]) as any[]

    // Extract report data from procedure results
    // MySQL procedures return array of result sets
    const reportData = result[0] || []

    // If no data, return empty report
    if (reportData.length === 0) {
      return {
        success: true,
        data: {
          year,
          month,
          month_name: new Date(year, month - 1).toLocaleString('default', { month: 'long' }),
          total_events: 0,
          completed_events: 0,
          pending_events: 0,
          cancelled_events: 0,
          total_revenue: 0,
          total_paid: 0,
          total_pending: 0,
          events: []
        }
      }
    }

    // Structure the response
    const summary = reportData[0]
    
    return {
      success: true,
      data: {
        year: summary.year,
        month: summary.month,
        month_name: summary.month_name,
        total_events: summary.total_events,
        completed_events: summary.completed_events,
        pending_events: summary.pending_events,
        cancelled_events: summary.cancelled_events,
        total_revenue: summary.total_revenue,
        total_paid: summary.total_paid,
        total_pending: summary.total_pending,
        events: reportData
      }
    }

  } catch (error: any) {
    console.error('Monthly report error:', error)
    
    throw createError({
      statusCode: 500,
      message: 'Failed to fetch monthly financial report'
    })
  }
})
