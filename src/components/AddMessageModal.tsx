'use client'

import { useState } from 'react'

interface AddMessageModalProps {
  isOpen: boolean
  inboxId: number | null
  onClose: () => void
  onMessageCreated: (messageId: string, messageText: string) => void
}

export default function AddMessageModal({ isOpen, inboxId, onClose, onMessageCreated }: AddMessageModalProps) {
  const [messageText, setMessageText] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!inboxId) {
      setError('No hay inbox seleccionado')
      return
    }

    if (!messageText.trim()) {
      setError('El mensaje no puede estar vacío')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inbox_id: inboxId,
          message_text: messageText.trim()
        }),
        credentials: 'include'
      })

      if (response.ok) {
        const data = await response.json()
        onMessageCreated(data.id, data.message_text)
        setMessageText('')
        onClose()
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Error al crear el mensaje')
      }
    } catch {
      setError('Error de conexión')
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setMessageText('')
    setError('')
    onClose()
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4 backdrop-blur-md bg-black/30">
      <div
        className="bg-white rounded-lg max-w-lg w-full p-6 shadow-xl animate-in fade-in-0 zoom-in-95 duration-200"
        onKeyDown={handleKeyPress}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">
            Agregar Nuevo Mensaje
          </h3>
          <button
            onClick={handleClose}
            className="text-gray-600 hover:text-gray-800"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Textarea */}
          <div className="mb-4">
            <label htmlFor="message-text" className="block text-sm font-semibold text-gray-900 mb-2">
              Texto del mensaje
            </label>
            <textarea
              id="message-text"
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-gray-600 focus:ring-2 focus:ring-gray-200 resize-none text-gray-900 placeholder:text-gray-400"
              placeholder="Escribe el texto del mensaje..."
              rows={4}
              maxLength={500}
              autoFocus
            />
            <div className="flex justify-between mt-1">
              <p className="text-xs text-gray-500 font-medium">
                Máximo 500 caracteres
              </p>
              <p className="text-xs text-gray-700 font-semibold">
                {messageText.length}/500
              </p>
            </div>
          </div>

          {/* Preview */}
          {messageText.trim() && (
            <div className="mb-4 p-3 bg-gray-100 rounded-lg border border-gray-300">
              <p className="text-xs text-gray-700 font-semibold mb-1">Vista previa:</p>
              <p className="text-sm text-gray-900 font-medium">{messageText.trim()}</p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm border border-red-200">
              {error}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 py-3 px-4 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={isLoading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading || !messageText.trim()}
              className="flex-1 py-3 px-4 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Creando...' : 'Crear Mensaje'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
