import { query } from '../../../db/connection'

export default defineEventHandler(async (event) => {
  try {
    const user = event.context.user
    const eventId = event.context.params?.id

    if (!eventId) {
      throw createError({
        statusCode: 400,
        message: 'Event ID is required'
      })
    }

    // Verify event exists and user has access
    const events = await query(
      'SELECT * FROM events WHERE event_id = ?',
      [eventId]
    ) as any[]

    if (!events || events.length === 0) {
      throw createError({
        statusCode: 404,
        message: 'Event not found'
      })
    }

    const eventData = events[0]

    // Check authorization
    if (user.role === 'client' && eventData.client_id !== user.userId) {
      throw createError({
        statusCode: 403,
        message: 'Not authorized to view this event'
      })
    }

    // Get payments for the event
    const payments = await query(
      `SELECT 
        p.*,
        u.full_name as recorded_by_name
      FROM payments p
      LEFT JOIN users u ON p.recorded_by = u.user_id
      WHERE p.event_id = ?
      ORDER BY p.payment_date DESC, p.created_at DESC`,
      [eventId]
    ) as any[]

    // Calculate totals
    const totalPaid = payments.reduce((sum: number, payment: any) => sum + parseFloat(payment.amount), 0)
    const estimatedCost = parseFloat(eventData.estimated_cost) || 0
    const balance = estimatedCost - totalPaid

    return {
      success: true,
      payments,
      summary: {
        totalPaid,
        estimatedCost,
        balance,
        paymentCount: payments.length
      }
    }

  } catch (error: any) {
    console.error('Get event payments error:', error)
    
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Failed to fetch event payments'
    })
  }
})
