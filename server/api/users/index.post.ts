import { query } from '../../db/connection'
import bcrypt from 'bcryptjs'

export default defineEventHandler(async (event) => {
  try {
    const user = event.context.user

    // Only admin can create users
    if (user.role !== 'admin') {
      throw createError({
        statusCode: 403,
        message: 'Access denied. Admin only.'
      })
    }

    const body = await readBody(event)
    const { email, password, full_name, phone, role } = body

    // Validation
    if (!email || !password || !full_name || !role) {
      throw createError({
        statusCode: 400,
        message: 'Email, password, full name, and role are required'
      })
    }

    // Check if email already exists
    const existingUsers = await query(
      'SELECT user_id FROM users WHERE email = ?',
      [email]
    ) as any[]

    if (existingUsers.length > 0) {
      throw createError({
        statusCode: 400,
        message: 'Email already exists'
      })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Insert user
    const result = await query(
      `INSERT INTO users (email, password_hash, full_name, phone, role, status)
       VALUES (?, ?, ?, ?, ?, 'active')`,
      [email, hashedPassword, full_name, phone || null, role]
    ) as any

    const newUser = await query(
      'SELECT user_id, email, full_name, phone, role, status, created_at FROM users WHERE user_id = ?',
      [result.insertId]
    ) as any[]

    return {
      success: true,
      message: 'User created successfully',
      data: newUser[0]
    }

  } catch (error: any) {
    console.error('Create user error:', error)
    
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Failed to create user'
    })
  }
})
