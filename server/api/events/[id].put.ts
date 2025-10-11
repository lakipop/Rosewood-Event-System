import { query } from '~/server/db/connection';
import { verifyToken } from '~/server/utils/jwt';

export default defineEventHandler(async (event) => {
  try {
    const authHeader = getHeader(event, 'authorization');
    if (!authHeader) {
      throw createError({
        statusCode: 401,
        message: 'Unauthorized'
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token) as any;
    const eventId = event.context.params?.id;
    const body = await readBody(event);

    if (!eventId) {
      throw createError({
        statusCode: 400,
        message: 'Event ID is required'
      });
    }

    // Check ownership for clients
    if (decoded.role === 'client') {
      const eventCheck = await query(
        'SELECT client_id FROM events WHERE event_id = ?',
        [eventId]
      );

      if (!eventCheck || (eventCheck as any).length === 0) {
        throw createError({
          statusCode: 404,
          message: 'Event not found'
        });
      }

      if ((eventCheck as any)[0].client_id !== decoded.userId) {
        throw createError({
          statusCode: 403,
          message: 'You can only update your own events'
        });
      }
    }

    // Build update query
    const updates: string[] = [];
    const params: any[] = [];

    if (body.event_name) {
      updates.push('event_name = ?');
      params.push(body.event_name);
    }
    if (body.event_type_id) {
      updates.push('event_type_id = ?');
      params.push(body.event_type_id);
    }
    if (body.event_date) {
      updates.push('event_date = ?');
      params.push(body.event_date);
    }
    if (body.event_time) {
      updates.push('event_time = ?');
      params.push(body.event_time);
    }
    if (body.venue) {
      updates.push('venue = ?');
      params.push(body.venue);
    }
    if (body.guest_count) {
      updates.push('guest_count = ?');
      params.push(body.guest_count);
    }
    if (body.budget) {
      updates.push('budget = ?');
      params.push(body.budget);
    }
    if (body.status && (decoded.role === 'admin' || decoded.role === 'manager')) {
      updates.push('status = ?');
      params.push(body.status);
    }

    if (updates.length === 0) {
      throw createError({
        statusCode: 400,
        message: 'No fields to update'
      });
    }

    params.push(eventId);

    await query(
      `UPDATE events SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE event_id = ?`,
      params
    );

    return {
      success: true,
      message: 'Event updated successfully'
    };
  } catch (error: any) {
    console.error('Error updating event:', error);
    if (error.statusCode) throw error;
    throw createError({
      statusCode: 500,
      message: 'Failed to update event'
    });
  }
});
