import { query } from '../../../db/connection'

export default defineEventHandler(async (event) => {
  try {
    const user = event.context.user
    const eventId = event.context.params?.id
    const body = await readBody(event)
    const { service_id, quantity, agreed_price } = body

    console.log('services.post: params:', { eventId, service_id, quantity, agreed_price, user: user?.userId })

    // Validation
    if (!eventId || !service_id || !quantity || !agreed_price) {
      throw createError({
        statusCode: 400,
        message: 'Event ID, service ID, quantity, and agreed price are required'
      })
    }

    // Verify event exists
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
        message: 'Not authorized to modify this event'
      })
    }

    // Call stored procedure and capture output
    await query(
      'CALL sp_add_event_service(?, ?, ?, ?, @success, @message)',
      [eventId, service_id, quantity, agreed_price]
    )

    const procResult = await query('SELECT @success as success, @message as message') as any[]
    console.log('sp_add_event_service result:', procResult[0])

    if (!procResult[0]?.success) {
      throw createError({ statusCode: 400, message: procResult[0]?.message || 'Procedure failed' })
    }

    // Optionally fetch the newly added service to return it
    const added = await query(
      `SELECT es.*, s.service_name, (es.quantity * es.agreed_price) AS subtotal
       FROM event_services es JOIN services s ON es.service_id = s.service_id
       WHERE es.event_id = ? AND es.service_id = ?
       ORDER BY es.added_at DESC LIMIT 1`,
      [eventId, service_id]
    ) as any[]

    return { success: true, message: procResult[0].message, service: (added as any[])[0] || null }

  } catch (error: any) {
    console.error('Add event service error:', error)
    
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Failed to add service to event'
    })
  }
})
