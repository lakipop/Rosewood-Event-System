import { query } from '~/server/db/connection';
import { verifyToken } from '~/server/utils/jwt';

export default defineEventHandler(async (event) => {
  try {
    // Verify authentication
    const authHeader = getHeader(event, 'authorization');
    if (!authHeader) {
      throw createError({
        statusCode: 401,
        message: 'Unauthorized'
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token) as any;

    // Only admin can delete services
    if (decoded.role !== 'admin') {
      throw createError({
        statusCode: 403,
        message: 'Only admins can delete services'
      });
    }

    const serviceId = event.context.params?.id;

    if (!serviceId) {
      throw createError({
        statusCode: 400,
        message: 'Service ID is required'
      });
    }

    // Check if service is used in any events
    const usageCheck = await query(
      'SELECT COUNT(*) as count FROM event_services WHERE service_id = ?',
      [serviceId]
    );

    if ((usageCheck as any)[0].count > 0) {
      throw createError({
        statusCode: 400,
        message: 'Cannot delete service that is used in events. Set it as unavailable instead.'
      });
    }

    await query('DELETE FROM services WHERE service_id = ?', [serviceId]);

    return {
      success: true,
      message: 'Service deleted successfully'
    };
  } catch (error: any) {
    console.error('Error deleting service:', error);
    if (error.statusCode) throw error;
    throw createError({
      statusCode: 500,
      message: 'Failed to delete service'
    });
  }
});
