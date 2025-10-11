import { query } from '../../../db/connection'

export default defineEventHandler(async (event) => {
  try {
    const user = event.context.user
    const eventId = event.context.params?.id
    const body = await readBody(event)
    const { service_id, quantity, unit_price, notes } = body

    // Validation
    if (!eventId || !service_id || !quantity || !unit_price) {
      throw createError({
        statusCode: 400,
        message: 'Event ID, service ID, quantity, and unit price are required'
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

    // Check authorization (only staff and admin can add services)
    if (user.role === 'client') {
      throw createError({
        statusCode: 403,
        message: 'Only staff can add services to events'
      })
    }

    // Verify service exists
    const services = await query(
      'SELECT * FROM services WHERE service_id = ?',
      [service_id]
    ) as any[]

    if (!services || services.length === 0) {
      throw createError({
        statusCode: 404,
        message: 'Service not found'
      })
    }

    // Check if service already added to event
    const existing = await query(
      'SELECT * FROM event_services WHERE event_id = ? AND service_id = ?',
      [eventId, service_id]
    ) as any[]

    if (existing && existing.length > 0) {
      throw createError({
        statusCode: 400,
        message: 'Service already added to this event'
      })
    }

    // Add service to event
    const result = await query(
      `INSERT INTO event_services (event_id, service_id, quantity, unit_price, notes, added_by)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [eventId, service_id, quantity, unit_price, notes || null, user.userId]
    ) as any

    // Get the created event service
    const eventServices = await query(
      `SELECT 
        es.*,
        s.service_name,
        s.category,
        s.description as service_description
      FROM event_services es
      JOIN services s ON es.service_id = s.service_id
      WHERE es.event_service_id = ?`,
      [result.insertId]
    ) as any[]

    return {
      success: true,
      message: 'Service added to event successfully',
      eventService: eventServices[0]
    }

  } catch (error: any) {
    console.error('Add event service error:', error)
    
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Failed to add service to event'
    })
  }
})
