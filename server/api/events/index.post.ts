import { query } from '../../db/connection'

export default defineEventHandler(async (event) => {
  try {
    const user = event.context.user
    const body = await readBody(event)

    const {
      eventName,
      eventTypeId,
      eventDate,
      eventTime,
      venue,
      guestCount,
      budget,
      specialNotes
    } = body

    // Validation
    if (!eventName || !eventTypeId || !eventDate) {
      throw createError({
        statusCode: 400,
        message: 'Event name, type, and date are required'
      })
    }

    // Set client_id based on user role
    let clientId = user.userId
    if (user.role === 'admin' || user.role === 'manager') {
      // Admins/managers can create events for clients
      clientId = body.clientId || user.userId
    }

    // Use stored procedure sp_create_event for validation and creation
    await query(
      `CALL sp_create_event(?, ?, ?, ?, ?, ?, ?, ?, @event_id, @message)`,
      [
        clientId,
        eventTypeId,
        eventName,
        eventDate,
        eventTime || null,
        venue || null,
        guestCount || 50,
        budget || null
      ]
    )

    // Get the output parameters
    const result = await query('SELECT @event_id as event_id, @message as message') as any[]
    const { event_id: eventId, message } = result[0]

    if (eventId === 0) {
      throw createError({
        statusCode: 400,
        message: message || 'Failed to create event'
      })
    }

    // Add special notes if provided (procedure doesn't handle this)
    if (specialNotes) {
      await query(
        'UPDATE events SET special_notes = ? WHERE event_id = ?',
        [specialNotes, eventId]
      )
    }

    // Fetch the created event using the view
    const events = await query(
      'SELECT * FROM v_event_summary WHERE event_id = ?',
      [eventId]
    ) as any[]

    return {
      success: true,
      message: message,
      data: events[0]
    }

  } catch (error: any) {
    console.error('Create event error:', error)
    
    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      message: error.message || 'Failed to create event'
    })
  }
})
