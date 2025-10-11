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

    // Insert event
    const result = await query(
      `INSERT INTO events 
       (client_id, event_type_id, event_name, event_date, event_time, venue, guest_count, budget, special_notes, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        clientId,
        eventTypeId,
        eventDate,
        eventTime || null,
        venue || null,
        guestCount || 50,
        budget || null,
        specialNotes || null,
        'inquiry'
      ]
    ) as any

    const eventId = result.insertId

    // Fetch the created event
    const events = await query(
      `SELECT 
        e.*,
        et.type_name,
        u.full_name as client_name
      FROM events e
      LEFT JOIN event_types et ON e.event_type_id = et.event_type_id
      LEFT JOIN users u ON e.client_id = u.user_id
      WHERE e.event_id = ?`,
      [eventId]
    ) as any[]

    return {
      success: true,
      data: events[0]
    }

  } catch (error: any) {
    console.error('Create event error:', error)
    
    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      message: 'Failed to create event'
    })
  }
})
