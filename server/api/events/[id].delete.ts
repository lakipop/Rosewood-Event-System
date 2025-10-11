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
    if (!token) {
      throw createError({
        statusCode: 401,
        message: 'Unauthorized - token not provided'
      });
    }
    const decoded = verifyToken(token) as any;
    const eventId = event.context.params?.id;

    if (!eventId) {
      throw createError({
        statusCode: 400,
        message: 'Event ID is required'
      });
    }

    // Check ownership and payments
    const eventCheck = await query(
      `SELECT e.client_id, COUNT(p.payment_id) as payment_count
       FROM events e
       LEFT JOIN payments p ON e.event_id = p.event_id AND p.status = 'completed'
       WHERE e.event_id = ?
       GROUP BY e.event_id`,
      [eventId]
    );

    if (!eventCheck || (eventCheck as any).length === 0) {
      throw createError({
        statusCode: 404,
        message: 'Event not found'
      });
    }

    const eventData = (eventCheck as any)[0];

    // Only admins or event owner can delete
    if (decoded.role === 'client' && eventData.client_id !== decoded.userId) {
      throw createError({
        statusCode: 403,
        message: 'You can only delete your own events'
      });
    }

    // Prevent deletion if payments exist
    if (eventData.payment_count > 0) {
      throw createError({
        statusCode: 400,
        message: 'Cannot delete event with payments. Cancel the event instead.'
      });
    }

    // Delete related records first
    await query('DELETE FROM event_services WHERE event_id = ?', [eventId]);
    await query('DELETE FROM activity_logs WHERE table_name = "events" AND record_id = ?', [eventId]);
    
    // Delete the event
    await query('DELETE FROM events WHERE event_id = ?', [eventId]);

    return {
      success: true,
      message: 'Event deleted successfully'
    };
  } catch (error: any) {
    console.error('Error deleting event:', error);
    if (error.statusCode) throw error;
    throw createError({
      statusCode: 500,
      message: 'Failed to delete event'
    });
  }
});
