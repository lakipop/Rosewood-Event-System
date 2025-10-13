import { query } from '../../db/connection'
import bcrypt from 'bcryptjs'

export default defineEventHandler(async (event) => {
  try {
    const user = event.context.user
    const userId = event.context.params?.id
    const body = await readBody(event)

    if (!userId) {
      throw createError({
        statusCode: 400,
        message: 'User ID is required'
      })
    }

    // Only admin can update users, or users can update themselves (limited fields)
    if (user.role !== 'admin' && user.userId !== parseInt(userId)) {
      throw createError({
        statusCode: 403,
        message: 'Access denied'
      })
    }

    // Get existing user
    const users = await query(
      'SELECT * FROM users WHERE user_id = ?',
      [userId]
    ) as any[]

    if (users.length === 0) {
      throw createError({
        statusCode: 404,
        message: 'User not found'
      })
    }

    const existingUser = users[0]
    const updates: string[] = []
    const params: any[] = []

    // Admin can update all fields, users can only update their own info
    if (user.role === 'admin') {
      if (body.full_name !== undefined) {
        updates.push('full_name = ?')
        params.push(body.full_name)
      }
      if (body.phone !== undefined) {
        updates.push('phone = ?')
        params.push(body.phone)
      }
      if (body.role !== undefined) {
        updates.push('role = ?')
        params.push(body.role)
      }
      if (body.status !== undefined) {
        updates.push('status = ?')
        params.push(body.status)
      }
    } else {
      // Regular users can only update their own name and phone
      if (body.full_name !== undefined) {
        updates.push('full_name = ?')
        params.push(body.full_name)
      }
      if (body.phone !== undefined) {
        updates.push('phone = ?')
        params.push(body.phone)
      }
    }

    // Password update (both admin and user can update)
    if (body.password) {
      const hashedPassword = await bcrypt.hash(body.password, 10)
      updates.push('password_hash = ?')
      params.push(hashedPassword)
    }

    if (updates.length === 0) {
      throw createError({
        statusCode: 400,
        message: 'No fields to update'
      })
    }

    params.push(userId)

    await query(
      `UPDATE users SET ${updates.join(', ')} WHERE user_id = ?`,
      params
    )

    // Get updated user
    const updatedUsers = await query(
      'SELECT user_id, email, full_name, phone, role, status, created_at FROM users WHERE user_id = ?',
      [userId]
    ) as any[]

    return {
      success: true,
      message: 'User updated successfully',
      data: updatedUsers[0]
    }

  } catch (error: any) {
    console.error('Update user error:', error)
    
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Failed to update user'
    })
  }
})
