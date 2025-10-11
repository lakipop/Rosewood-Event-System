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

    // Only admin and manager can update services
    if (decoded.role !== 'admin' && decoded.role !== 'manager') {
      throw createError({
        statusCode: 403,
        message: 'Only admins and managers can update services'
      });
    }

    const serviceId = event.context.params?.id;
    const body = await readBody(event);

    if (!serviceId) {
      throw createError({
        statusCode: 400,
        message: 'Service ID is required'
      });
    }

    // Build update query dynamically
    const updates: string[] = [];
    const params: any[] = [];

    if (body.service_name !== undefined) {
      updates.push('service_name = ?');
      params.push(body.service_name);
    }
    if (body.category !== undefined) {
      updates.push('category = ?');
      params.push(body.category);
    }
    if (body.description !== undefined) {
      updates.push('description = ?');
      params.push(body.description);
    }
    if (body.unit_price !== undefined) {
      updates.push('unit_price = ?');
      params.push(body.unit_price);
    }
    if (body.unit_type !== undefined) {
      updates.push('unit_type = ?');
      params.push(body.unit_type);
    }
    if (body.is_available !== undefined) {
      updates.push('is_available = ?');
      params.push(body.is_available ? 1 : 0);
    }

    if (updates.length === 0) {
      throw createError({
        statusCode: 400,
        message: 'No fields to update'
      });
    }

    params.push(serviceId);

    await query(
      `UPDATE services SET ${updates.join(', ')} WHERE service_id = ?`,
      params
    );

    return {
      success: true,
      message: 'Service updated successfully'
    };
  } catch (error: any) {
    console.error('Error updating service:', error);
    if (error.statusCode) throw error;
    throw createError({
      statusCode: 500,
      message: 'Failed to update service'
    });
  }
});
