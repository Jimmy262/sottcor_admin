import { NextRequest, NextResponse } from 'next/server'
import { isAuthenticated } from '@/lib/auth'
import { deleteMessage, checkMessageExists, getMessageStats } from '@/lib/database'

// DELETE - Eliminar un mensaje
export async function DELETE(
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
    const messageId = BigInt(id)

    // Verificar que el mensaje existe
    const messageExists = await checkMessageExists(messageId)
    if (!messageExists) {
      return NextResponse.json(
        { error: 'Mensaje no encontrado' },
        { status: 404 }
      )
    }

    // Obtener estadísticas antes de eliminar (para informar al usuario)
    const stats = await getMessageStats(messageId)

    // Eliminar el mensaje (los pesos se eliminan automáticamente por CASCADE)
    await deleteMessage(messageId)

    return NextResponse.json({
      message: 'Mensaje eliminado exitosamente',
      messageId: id,
      deletedWeights: stats.assigned_vendors
    })
  } catch (error) {
    console.error('Error eliminando mensaje:', error)
    return NextResponse.json(
      { error: 'Error al eliminar el mensaje' },
      { status: 500 }
    )
  }
}
