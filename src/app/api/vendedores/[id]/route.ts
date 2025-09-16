import { NextRequest, NextResponse } from 'next/server'
import { isAuthenticated } from '@/lib/auth'
import { updateVendedorPeso, checkUserExists, checkInboxExists } from '@/lib/database'

// PUT - Actualizar peso de un vendedor en un inbox específico
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
    const { peso, inboxId } = body

    // Validar parámetros
    if (typeof peso !== 'number' || peso < 0) {
      return NextResponse.json(
        { error: 'El peso debe ser un número positivo' },
        { status: 400 }
      )
    }

    if (!inboxId) {
      return NextResponse.json(
        { error: 'ID del inbox requerido' },
        { status: 400 }
      )
    }

    const userId = parseInt(id)
    const inboxIdNum = parseInt(inboxId)

    // Verificar que el usuario existe
    const userExists = await checkUserExists(userId)
    if (!userExists) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      )
    }

    // Verificar que el inbox existe
    const inboxExists = await checkInboxExists(inboxIdNum)
    if (!inboxExists) {
      return NextResponse.json(
        { error: 'Inbox no encontrado' },
        { status: 404 }
      )
    }

    // Actualizar peso
    await updateVendedorPeso(userId, inboxIdNum, peso)

    return NextResponse.json({
      message: 'Peso actualizado exitosamente',
      userId,
      inboxId: inboxIdNum,
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
