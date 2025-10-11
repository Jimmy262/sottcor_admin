import { NextRequest, NextResponse } from 'next/server'
import { isAuthenticated } from '@/lib/auth'
import { getVendedoresByMessage } from '@/lib/database'

// GET - Obtener vendedores con sus pesos para un mensaje específico
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
    const messageIdParam = searchParams.get('message_id')
    const inboxIdParam = searchParams.get('inbox_id')

    if (!messageIdParam || !inboxIdParam) {
      return NextResponse.json(
        { error: 'Parámetros message_id e inbox_id requeridos' },
        { status: 400 }
      )
    }

    const messageId = BigInt(messageIdParam)
    const inboxId = parseInt(inboxIdParam)

    if (isNaN(inboxId)) {
      return NextResponse.json(
        { error: 'inbox_id debe ser un número válido' },
        { status: 400 }
      )
    }

    const vendedores = await getVendedoresByMessage(messageId, inboxId)

    // Convertir bigint a string para JSON
    const vendedoresJson = vendedores.map(v => ({
      ...v,
      user_id: v.user_id.toString(),
      message_id: v.message_id.toString()
    }))

    return NextResponse.json(vendedoresJson)
  } catch (error) {
    console.error('Error en API vendedores:', error)
    return NextResponse.json(
      { error: 'Error al obtener vendedores' },
      { status: 500 }
    )
  }
}
