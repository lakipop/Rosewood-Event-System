import { query } from '../../db/connection'

export default defineEventHandler(async (event) => {
  try {
    const user = event.context.user
    const body = await readBody(event)
    const { event_id, amount, payment_method, payment_type: providedPaymentType, reference_number } = body

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

    // Calculate total cost and remaining balance
    const costResult = await query(
      `SELECT 
        COALESCE(SUM(es.quantity * es.agreed_price), 0) as total_cost,
        COALESCE((SELECT SUM(amount) FROM payments p 
                  WHERE p.event_id = ? AND p.status = 'completed'), 0) as total_paid
       FROM event_services es 
       WHERE es.event_id = ? AND es.status != 'cancelled'`,
      [event_id, event_id]
    ) as any[]

    const { total_cost: totalCost, total_paid: totalPaid } = costResult[0] || { total_cost: 0, total_paid: 0 }
    const remainingBalance = Number(totalCost) - Number(totalPaid)

    // Automatically determine payment_type based on amount
    let payment_type = providedPaymentType?.trim?.() || ''

    console.log('Payment type provided:', { providedPaymentType, payment_type, isEmpty: !payment_type })

    if (!payment_type) {
      // Calculate payment type based on amount vs remaining balance
      const numTotalCost = Number(totalCost)
      const numTotalPaid = Number(totalPaid)
      const numAmount = Number(amount)
      const newTotalPaid = numTotalPaid + numAmount

      console.log('Auto-calculating payment type:', {
        totalCost: numTotalCost,
        totalPaid: numTotalPaid,
        amount: numAmount,
        newTotalPaid,
        remainingBalance
      })

      // If no services are added yet, treat first payment as advance
      if (numTotalCost === 0) {
        payment_type = 'advance'
      } else if (newTotalPaid >= numTotalCost) {
        // If total paid after this payment >= total cost, it's a final payment
        payment_type = 'final'
      } else if (numAmount >= remainingBalance && remainingBalance > 0) {
        // If this payment covers the remaining balance, it's final
        payment_type = 'final'
      } else {
        // Otherwise it's partial (or advance if it's the first payment)
        payment_type = numTotalPaid === 0 ? 'advance' : 'partial'
      }

      console.log('Calculated payment type:', payment_type)
    } else {
      // Validate provided payment_type is a valid ENUM value
      const validPaymentTypes = ['advance', 'partial', 'final']
      if (!validPaymentTypes.includes(payment_type)) {
        throw createError({
          statusCode: 400,
          message: `Invalid payment type. Must be one of: ${validPaymentTypes.join(', ')}`
        })
      }
    }

    // Final validation - ensure payment_type is definitely a valid enum value
    const validPaymentTypes = ['advance', 'partial', 'final']
    if (!payment_type || !validPaymentTypes.includes(payment_type)) {
      console.error('CRITICAL: Invalid payment_type after processing:', { payment_type, validPaymentTypes })
      throw createError({
        statusCode: 400,
        message: `Payment type is invalid: "${payment_type}". Must be one of: ${validPaymentTypes.join(', ')}`
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
      [event_id, amount, payment_method, payment_type, reference_number || null]
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
      data: paymentDetails[0],
      calculatedPaymentType: payment_type,
      costDetails: {
        totalCost,
        totalPaid,
        remainingBalance,
        newTotalAfterPayment: totalPaid + amount
      }
    }

  } catch (error: any) {
    console.error('Create payment error:', error)
    
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Failed to create payment'
    })
  }
})
