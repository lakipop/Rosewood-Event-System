import { query } from '../../../db/connection'

export default defineEventHandler(async (event) => {
  try {
    const user = event.context.user
    const eventId = event.context.params?.id

    if (!eventId) {
      throw createError({
        statusCode: 400,
        message: 'Event ID is required'
      })
    }

    // Verify event exists and user has access
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
        message: 'Not authorized to view this event'
      })
    }

    // Get event services
    const eventServices = await query(
      `SELECT 
        es.*,
        s.service_name,
        s.category,
        s.description as service_description,
        s.base_price
      FROM event_services es
      JOIN services s ON es.service_id = s.service_id
      WHERE es.event_id = ?
      ORDER BY es.added_at DESC`,
      [eventId]
    )

    return {
      success: true,
      services: eventServices
    }

  } catch (error: any) {
    console.error('Get event services error:', error)
    
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Failed to fetch event services'
    })
  }
})
