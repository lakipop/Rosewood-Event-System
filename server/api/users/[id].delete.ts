import { query } from '../../db/connection'

export default defineEventHandler(async (event) => {
  try {
    const user = event.context.user
    const userId = event.context.params?.id

    // Only admin can delete users
    if (user.role !== 'admin') {
      throw createError({
        statusCode: 403,
        message: 'Access denied. Admin only.'
      })
    }

    if (!userId) {
      throw createError({
        statusCode: 400,
        message: 'User ID is required'
      })
    }

    // Check if user exists
    const users = await query(
      'SELECT user_id FROM users WHERE user_id = ?',
      [userId]
    ) as any[]

    if (users.length === 0) {
      throw createError({
        statusCode: 404,
        message: 'User not found'
      })
    }

    // Cannot delete yourself
    if (user.userId === parseInt(userId)) {
      throw createError({
        statusCode: 400,
        message: 'Cannot delete your own account'
      })
    }

    // Soft delete by setting status to 'inactive'
    await query(
      `UPDATE users SET status = 'inactive' WHERE user_id = ?`,
      [userId]
    )

    return {
      success: true,
      message: 'User deactivated successfully'
    }

  } catch (error: any) {
    console.error('Delete user error:', error)
    
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Failed to delete user'
    })
  }
})
