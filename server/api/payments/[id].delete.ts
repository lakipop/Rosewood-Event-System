import { query } from '../../db/connection'

export default defineEventHandler(async (event) => {
  try {
    const user = event.context.user
    const paymentId = getRouterParam(event, 'id')

    // Only admin and manager can delete payments
    if (user.role !== 'admin' && user.role !== 'manager') {
      throw createError({
        statusCode: 403,
        message: 'Only admin and manager can delete payments'
      })
    }

    if (!paymentId) {
      throw createError({
        statusCode: 400,
        message: 'Payment ID is required'
      })
    }

    // Check if payment exists
    const existing = await query(
      'SELECT * FROM payments WHERE payment_id = ?',
      [paymentId]
    ) as any[]

    if (!existing || existing.length === 0) {
      throw createError({
        statusCode: 404,
        message: 'Payment not found'
      })
    }

    // Delete payment
    await query('DELETE FROM payments WHERE payment_id = ?', [paymentId])

    return {
      success: true,
      message: 'Payment deleted successfully'
    }

  } catch (error: any) {
    console.error('Delete payment error:', error)
    
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Failed to delete payment'
    })
  }
})
