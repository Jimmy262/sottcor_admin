import { NextRequest, NextResponse } from 'next/server'
import { isAuthenticated } from '@/lib/auth'
import { getInboxes } from '@/lib/database'

// GET - Obtener todos los inboxes disponibles
export async function GET(request: NextRequest) {
  try {
    // Verificar autenticación
    if (!isAuthenticated(request)) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const inboxes = await getInboxes()
    return NextResponse.json(inboxes)
  } catch (error) {
    console.error('Error en API inboxes:', error)
    return NextResponse.json(
      { error: 'Error al obtener inboxes' },
      { status: 500 }
    )
  }
}