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

    // Only admin and manager can create services
    if (decoded.role !== 'admin' && decoded.role !== 'manager') {
      throw createError({
        statusCode: 403,
        message: 'Only admins and managers can create services'
      });
    }

    const body = await readBody(event);
    
    // Validation
    if (!body.service_name || !body.category || !body.unit_price || !body.unit_type) {
      throw createError({
        statusCode: 400,
        message: 'Service name, category, unit price, and unit type are required'
      });
    }

    const result = await query(
      `INSERT INTO services (service_name, category, description, unit_price, unit_type, is_available) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        body.service_name,
        body.category,
        body.description || null,
        body.unit_price,
        body.unit_type,
        body.is_available !== false ? 1 : 0
      ]
    );

    return {
      success: true,
      message: 'Service created successfully',
      service_id: (result as any).insertId
    };
  } catch (error: any) {
    console.error('Error creating service:', error);
    if (error.statusCode) throw error;
    throw createError({
      statusCode: 500,
      message: 'Failed to create service'
    });
  }
});
