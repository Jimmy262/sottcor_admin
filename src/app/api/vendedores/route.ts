import { NextRequest, NextResponse } from 'next/server'
import { isAuthenticated } from '@/lib/auth'
import { getVendedoresByInbox } from '@/lib/database'

// GET - Obtener vendedores de un inbox específico
export async function GET(request: NextRequest) {
  try {
    // Verificar autenticación
    if (!isAuthenticated(request)) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const inboxName = searchParams.get('inbox')

    if (!inboxName) {
      return NextResponse.json(
        { error: 'Parámetro inbox requerido' },
        { status: 400 }
      )
    }

    const vendedores = await getVendedoresByInbox(inboxName)
    return NextResponse.json(vendedores)
  } catch (error) {
    console.error('Error en API vendedores:', error)
    return NextResponse.json(
      { error: 'Error al obtener vendedores' },
      { status: 500 }
    )
  }
}
