import { query } from '../../db/connection'

export default defineEventHandler(async (event) => {
  try {
    const user = event.context.user
    const paymentId = event.context.params?.id
    const body = await readBody(event)
    const { amount, payment_method, payment_date, notes } = body

    // Validation
    if (!paymentId) {
      throw createError({
        statusCode: 400,
        message: 'Payment ID is required'
      })
    }

    // Get existing payment
    const payments = await query(
      `SELECT p.*, e.client_id 
       FROM payments p
       JOIN events e ON p.event_id = e.event_id
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

    // Check authorization
    if (user.role === 'client' && payment.client_id !== user.userId) {
      throw createError({
        statusCode: 403,
        message: 'Not authorized to update this payment'
      })
    }

    // Update payment
    await query(
      `UPDATE payments 
       SET amount = ?, payment_method = ?, payment_date = ?, notes = ?
       WHERE payment_id = ?`,
      [
        amount !== undefined ? amount : payment.amount,
        payment_method || payment.payment_method,
        payment_date || payment.payment_date,
        notes !== undefined ? notes : payment.notes,
        paymentId
      ]
    )

    // Get updated payment
    const updatedPayments = await query(
      'SELECT * FROM payments WHERE payment_id = ?',
      [paymentId]
    ) as any[]

    return {
      success: true,
      message: 'Payment updated successfully',
      payment: updatedPayments[0]
    }

  } catch (error: any) {
    console.error('Update payment error:', error)
    
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Failed to update payment'
    })
  }
})
