import { query } from '../../../db/connection'

export default defineEventHandler(async (event) => {
  try {
    const user = event.context.user
    const eventId = event.context.params?.id
    const body = await readBody(event)
    const { service_id, quantity, agreed_price } = body

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

    // Use stored procedure to add service with validation
    // sp_add_event_service validates:
    // - Service exists and is active
    // - Service not already added to event
    // - Agreed price is positive
    // Triggers will:
    // - Log activity (tr_after_service_add)
    // - Warn if over budget (tr_budget_overrun_warning)
    await query(
      'CALL sp_add_event_service(?, ?, ?, ?, @success, @message)',
      [eventId, service_id, quantity, agreed_price]
    )

    // Get the procedure result
    const result = await query('SELECT @success as success, @message as message') as any[]
    const { success, message } = result[0]

    if (!success) {
      throw createError({
        statusCode: 400,
        message: message || 'Failed to add service'
      })
    }

    // Get the added service details with subtotal
    const addedService = await query(
      `SELECT 
        es.*,
        s.service_name,
        s.category,
        s.unit_type,
        s.description as service_description,
        (es.quantity * es.agreed_price) as subtotal
      FROM event_services es
      JOIN services s ON es.service_id = s.service_id
      WHERE es.event_id = ?
      ORDER BY es.added_at DESC
      LIMIT 1`,
      [eventId]
    ) as any[]

    return {
      success: true,
      message: message,
      eventService: addedService[0]
    }

  } catch (error: any) {
    console.error('Add event service error:', error)
    
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Failed to add service to event'
    })
  }
})
