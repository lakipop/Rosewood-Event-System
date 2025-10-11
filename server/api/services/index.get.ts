import { query } from '~/server/db/connection';

export default defineEventHandler(async (event) => {
  try {
    const category = getQuery(event).category as string | undefined;
    
    let sql = `
      SELECT 
        service_id, service_name, category, description, 
        unit_price, unit_type, is_available, created_at, updated_at
      FROM services
      WHERE 1=1
    `;
    
    const params: any[] = [];
    
    // Filter by category if provided
    if (category) {
      sql += ' AND category = ?';
      params.push(category);
    }
    
    // Only show available services to non-authenticated users
    sql += ' ORDER BY category, service_name';
    
    const services = await query(sql, params);
    
    return {
      success: true,
      services
    };
  } catch (error: any) {
    console.error('Error fetching services:', error);
    throw createError({
      statusCode: 500,
      message: 'Failed to fetch services'
    });
  }
});
