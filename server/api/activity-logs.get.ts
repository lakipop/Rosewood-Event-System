import { getPool } from '../db/connection'

export default defineEventHandler(async (event) => {
  const queryParams = getQuery(event)
  const action = queryParams.action as string || ''
  const table = queryParams.table as string || ''
  const days = parseInt(queryParams.days as string) || 7

  try {
    const pool = getPool()
    
    // Build query with filters
    let sql = `
      SELECT 
        log_id,
        user_id,
        user_name,
        action_type,
        table_name,
        record_id,
        description,
        created_at
      FROM v_user_activity
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
    `
    const params: any[] = [days]
    
    if (action) {
      sql += ' AND action_type = ?'
      params.push(action)
    }
    
    if (table) {
      sql += ' AND table_name = ?'
      params.push(table)
    }
    
    sql += ' ORDER BY created_at DESC LIMIT 500'
    
    const [logs] = await pool.query(sql, params)

    return {
      success: true,
      data: logs
    }
  } catch (error: any) {
    console.error('Database error:', error)
    throw createError({
      statusCode: 500,
      message: 'Failed to fetch activity logs'
    })
  }
})
