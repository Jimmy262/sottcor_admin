import jwt from 'jsonwebtoken'

export function verifyToken(token: string): boolean {
  try {
    const jwtSecret = process.env.JWT_SECRET
    if (!jwtSecret) return false

    jwt.verify(token, jwtSecret)
    return true
  } catch {
    return false
  }
}

export function isAuthenticated(request: Request): boolean {
  try {
    const cookieHeader = request.headers.get('cookie')
    if (!cookieHeader) return false

    const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split('=')
      acc[key] = value
      return acc
    }, {} as Record<string, string>)

    const token = cookies['auth-token']
    if (!token) return false

    return verifyToken(token)
  } catch {
    return false
  }
}