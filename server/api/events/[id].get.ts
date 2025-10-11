import { query } from '~/server/db/connection';

export default defineEventHandler(async (event) => {
  try {
    const eventId = event.context.params?.id;

    if (!eventId) {
      throw createError({
        statusCode: 400,
        message: 'Event ID is required'
      });
    }

    const eventData = await query(
      `SELECT 
        e.*,
        et.type_name,
        u.full_name as client_name,
        u.email as client_email,
        u.phone as client_phone
       FROM events e
       JOIN event_types et ON e.event_type_id = et.event_type_id
       JOIN users u ON e.client_id = u.user_id
       WHERE e.event_id = ?`,
      [eventId]
    );

    if (!eventData || (eventData as any).length === 0) {
      throw createError({
        statusCode: 404,
        message: 'Event not found'
      });
    }

    // Get services
    const services = await query(
      `SELECT 
        es.*,
        s.service_name,
        s.category,
        s.unit_type
       FROM event_services es
       JOIN services s ON es.service_id = s.service_id
       WHERE es.event_id = ?`,
      [eventId]
    );

    // Get payments
    const payments = await query(
      'SELECT * FROM payments WHERE event_id = ? ORDER BY payment_date DESC',
      [eventId]
    );

    return {
      success: true,
      event: (eventData as any)[0],
      services,
      payments
    };
  } catch (error: any) {
    console.error('Error fetching event details:', error);
    if (error.statusCode) throw error;
    throw createError({
      statusCode: 500,
      message: 'Failed to fetch event details'
    });
  }
});
