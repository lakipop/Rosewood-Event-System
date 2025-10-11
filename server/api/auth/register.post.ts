import bcrypt from 'bcryptjs'
import { query } from '../../db/connection'
import { generateToken } from '../../utils/jwt'
import { validateEmail, validatePassword } from '../../utils/validation'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { email, password, fullName, phone } = body

    // Validation
    if (!email || !password || !fullName) {
      throw createError({
        statusCode: 400,
        message: 'Email, password, and full name are required'
      })
    }

    if (!validateEmail(email)) {
      throw createError({
        statusCode: 400,
        message: 'Invalid email format'
      })
    }

    const passwordValidation = validatePassword(password)
    if (!passwordValidation.valid) {
      throw createError({
        statusCode: 400,
        message: passwordValidation.message
      })
    }

    // Check if user already exists
    const existingUsers = await query(
      'SELECT user_id FROM users WHERE email = ?',
      [email]
    ) as any[]

    if (existingUsers && existingUsers.length > 0) {
      throw createError({
        statusCode: 409,
        message: 'User with this email already exists'
      })
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10)

    // Insert new user
    const result = await query(
      'INSERT INTO users (email, password_hash, full_name, phone, role) VALUES (?, ?, ?, ?, ?)',
      [email, passwordHash, fullName, phone || null, 'client']
    ) as any

    const userId = result.insertId

    // Generate JWT token
    const token = generateToken({
      userId,
      email,
      role: 'client'
    })

    // Return user data
    return {
      success: true,
      token,
      user: {
        userId,
        email,
        fullName,
        role: 'client',
        status: 'active'
      }
    }

  } catch (error: any) {
    console.error('Registration error:', error)
    
    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      message: 'Internal server error'
    })
  }
})
