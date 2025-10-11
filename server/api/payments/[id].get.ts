import { query } from '../../db/connection'

export default defineEventHandler(async (event) => {
  try {
    const user = event.context.user
    const paymentId = getRouterParam(event, 'id')

    if (!paymentId) {
      throw createError({
        statusCode: 400,
        message: 'Payment ID is required'
      })
    }

    // Get payment with event details
    const payments = await query(
      `SELECT 
        p.*,
        e.event_name,
        e.client_id,
        u.full_name as client_name
      FROM payments p
      LEFT JOIN events e ON p.event_id = e.event_id
      LEFT JOIN users u ON e.client_id = u.user_id
      WHERE p.payment_id = ?`,
      [paymentId]
    ) as any[]

    if (!payments || payments.length === 0) {
      throw createError({
        statusCode: 404,
        message: 'Payment not found'
      })
    }

    const payment = payments[0]

    // Check access
    if (user.role === 'client' && payment.client_id !== user.userId) {
      throw createError({
        statusCode: 403,
        message: 'Access denied'
      })
    }

    return {
      success: true,
      data: payment
    }

  } catch (error: any) {
    console.error('Get payment error:', error)
    
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Failed to fetch payment'
    })
  }
})
