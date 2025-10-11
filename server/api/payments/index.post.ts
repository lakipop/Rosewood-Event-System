import { query } from '../../db/connection'

export default defineEventHandler(async (event) => {
  try {
    const user = event.context.user
    const body = await readBody(event)
    const { event_id, amount, payment_method, payment_type, reference_number } = body

    // Validation
    if (!event_id || !amount || !payment_method) {
      throw createError({
        statusCode: 400,
        message: 'Event ID, amount, and payment method are required'
      })
    }

    // Verify event exists and user has access
    const events = await query(
      'SELECT * FROM events WHERE event_id = ?',
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

    // Use stored procedure to process payment with validation
    // sp_process_payment validates:
    // - Event exists and is not cancelled
    // - Amount is positive
    // - Payment method is valid
    // Triggers will:
    // - Log activity (tr_after_payment_insert)
    // - Auto-confirm event if fully paid (tr_update_event_status_on_payment)
    // - Generate reference number if not provided (tr_generate_payment_reference)
    await query(
      'CALL sp_process_payment(?, ?, ?, ?, ?, @payment_id, @message)',
      [event_id, amount, payment_method, payment_type || 'deposit', reference_number || null]
    )

    // Get the procedure result
    const result = await query('SELECT @payment_id as payment_id, @message as message') as any[]
    const { payment_id, message } = result[0]

    if (!payment_id) {
      throw createError({
        statusCode: 400,
        message: message || 'Failed to process payment'
      })
    }

    // Get the payment details using v_payment_summary view
    const paymentDetails = await query(
      'SELECT * FROM v_payment_summary WHERE payment_id = ?',
      [payment_id]
    ) as any[]

    // Check if event was auto-confirmed (trigger fired)
    const updatedEvent = await query(
      'SELECT status FROM events WHERE event_id = ?',
      [event_id]
    ) as any[]

    const eventConfirmed = updatedEvent[0]?.status === 'confirmed'

    return {
      success: true,
      message: message,
      eventConfirmed: eventConfirmed, // Notify if event was auto-confirmed
      data: paymentDetails[0]
    }

  } catch (error: any) {
    console.error('Create payment error:', error)
    
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Failed to create payment'
    })
  }
})
