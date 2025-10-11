import bcrypt from 'bcryptjs'
import { query } from '../../db/connection'
import { generateToken } from '../../utils/jwt'
import { validateEmail } from '../../utils/validation'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { email, password } = body

    // Validation
    if (!email || !password) {
      throw createError({
        statusCode: 400,
        message: 'Email and password are required'
      })
    }

    if (!validateEmail(email)) {
      throw createError({
        statusCode: 400,
        message: 'Invalid email format'
      })
    }

    // Find user
    const users = await query(
      'SELECT user_id, email, password_hash, full_name, role, status FROM users WHERE email = ?',
      [email]
    ) as any[]

    if (!users || users.length === 0) {
      throw createError({
        statusCode: 401,
        message: 'Invalid credentials'
      })
    }

    const user = users[0]

    // Check if user is active
    if (user.status !== 'active') {
      throw createError({
        statusCode: 403,
        message: 'Account is not active'
      })
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash)
    
    if (!isValidPassword) {
      throw createError({
        statusCode: 401,
        message: 'Invalid credentials'
      })
    }

    // Generate JWT token
    const token = generateToken({
      userId: user.user_id,
      email: user.email,
      role: user.role
    })

    // Return user data (without password)
    return {
      success: true,
      token,
      user: {
        userId: user.user_id,
        email: user.email,
        fullName: user.full_name,
        role: user.role,
        status: user.status
      }
    }

  } catch (error: any) {
    console.error('Login error:', error)
    
    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      message: 'Internal server error'
    })
  }
})
