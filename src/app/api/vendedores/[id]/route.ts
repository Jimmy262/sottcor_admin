import { NextRequest, NextResponse } from 'next/server'
import { isAuthenticated } from '@/lib/auth'
import { updateMessageWeight, checkUserExists, checkMessageExists } from '@/lib/database'

// PUT - Actualizar peso de un vendedor para un mensaje específico
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verificar autenticación
    if (!isAuthenticated(request)) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const { id } = await params
    const body = await request.json()
    const { peso, messageId } = body

    // Validar parámetros
    if (typeof peso !== 'number' || peso < 0) {
      return NextResponse.json(
        { error: 'El peso debe ser un número positivo' },
        { status: 400 }
      )
    }

    if (!messageId) {
      return NextResponse.json(
        { error: 'ID del mensaje requerido' },
        { status: 400 }
      )
    }

    const userId = BigInt(id)
    const messageIdBig = BigInt(messageId)

    // Verificar que el usuario existe
    const userExists = await checkUserExists(userId)
    if (!userExists) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      )
    }

    // Verificar que el mensaje existe
    const messageExists = await checkMessageExists(messageIdBig)
    if (!messageExists) {
      return NextResponse.json(
        { error: 'Mensaje no encontrado' },
        { status: 404 }
      )
    }

    // Actualizar peso
    await updateMessageWeight(messageIdBig, userId, peso)

    return NextResponse.json({
      message: 'Peso actualizado exitosamente',
      userId: userId.toString(),
      messageId: messageIdBig.toString(),
      peso
    })
  } catch (error) {
    console.error('Error actualizando peso:', error)
    return NextResponse.json(
      { error: 'Error al actualizar el peso' },
      { status: 500 }
    )
  }
}
