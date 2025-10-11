import { query } from '../../db/connection'

export default defineEventHandler(async (event) => {
  try {
    const user = event.context.user
    const body = await readBody(event)
    const { event_id, amount, payment_method, payment_date, notes } = body

    // Validation
    if (!event_id || !amount || !payment_method) {
      throw createError({
        statusCode: 400,
        message: 'Event ID, amount, and payment method are required'
      })
    }

    // Verify event exists and user has access
    const events = await query(
      `SELECT e.*, 
        (SELECT COALESCE(SUM(amount), 0) FROM payments WHERE event_id = e.event_id) as total_paid
       FROM events e WHERE e.event_id = ?`,
      [event_id]
    ) as any[]

    if (!events || events.length === 0) {
      throw createError({
        statusCode: 404,
        message: 'Event not found'
      })
    }

    const eventData = events[0]

    // Check access
    if (user.role === 'client' && eventData.client_id !== user.userId) {
      throw createError({
        statusCode: 403,
        message: 'Access denied'
      })
    }

    // Insert payment
    const result = await query(
      `INSERT INTO payments (event_id, amount, payment_method, payment_date, notes) 
       VALUES (?, ?, ?, ?, ?)`,
      [event_id, amount, payment_method, payment_date || new Date(), notes || null]
    ) as any

    // Get the inserted payment
    const newPayment = await query(
      'SELECT * FROM payments WHERE payment_id = ?',
      [result.insertId]
    )

    return {
      success: true,
      message: 'Payment recorded successfully',
      data: (newPayment as any[])[0]
    }

  } catch (error: any) {
    console.error('Create payment error:', error)
    
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Failed to create payment'
    })
  }
})
