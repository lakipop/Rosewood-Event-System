import { query } from '../../db/connection'

export default defineEventHandler(async (event) => {
  try {
    const user = event.context.user

    // Only admin can view all users
    if (user.role !== 'admin') {
      throw createError({
        statusCode: 403,
        message: 'Access denied. Admin only.'
      })
    }

    const { role, status, search } = getQuery(event)

    // Build query with filters
    let sql = `
      SELECT 
        user_id,
        email,
        full_name,
        phone,
        role,
        status,
        created_at
      FROM users
      WHERE 1=1
    `
    
    const params: any[] = []

    if (role) {
      sql += ' AND role = ?'
      params.push(role)
    }

    if (status) {
      sql += ' AND status = ?'
      params.push(status)
    }

    if (search) {
      sql += ' AND (full_name LIKE ? OR email LIKE ?)'
      params.push(`%${search}%`, `%${search}%`)
    }

    sql += ' ORDER BY created_at DESC'

    const users = await query(sql, params)

    // Get user counts by role
    const roleCountsQuery = `
      SELECT role, COUNT(*) as count
      FROM users
      GROUP BY role
    `
    const roleCounts = await query(roleCountsQuery)

    return {
      success: true,
      data: users,
      roleCounts
    }

  } catch (error: any) {
    console.error('Get users error:', error)
    
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Failed to fetch users'
    })
  }
})
