'use client'

import { useState, useEffect } from 'react'

interface Vendedor {
  user_id: string
  user_name: string
  message_id: string
  message_text: string
  peso: number
}

interface WeightModalProps {
  vendedor: Vendedor | null
  isOpen: boolean
  onClose: () => void
  onSave: (vendedorId: string, newWeight: number) => void
}

export default function WeightModal({ vendedor, isOpen, onClose, onSave }: WeightModalProps) {
  const [weight, setWeight] = useState<number>(0)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (vendedor) {
      setWeight(vendedor.peso || 0)
    }
  }, [vendedor])

  const handleSave = async () => {
    if (!vendedor) return

    setIsLoading(true)
    try {
      await onSave(vendedor.user_id, weight)
      onClose()
    } catch (error) {
      console.error('Error saving weight:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave()
    } else if (e.key === 'Escape') {
      onClose()
    }
  }

  if (!isOpen || !vendedor) return null

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4 backdrop-blur-md">
      <div className="bg-white rounded-lg max-w-sm w-full p-6 shadow-xl animate-in fade-in-0 zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">
            {vendedor.user_name}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-gray-800"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Weight Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Peso actual: {vendedor.peso}
          </label>
          <input
            type="number"
            min="0"
            max="100"
            value={weight}
            onChange={(e) => setWeight(parseInt(e.target.value) || 0)}
            onKeyPress={handleKeyPress}
            className="w-full px-4 py-3 text-center text-xl font-semibold text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-500"
            placeholder="Nuevo peso"
            autoFocus
          />
          <p className="text-xs text-gray-600 mt-2 text-center">
            Escribe un número o usa los botones rápidos
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-4 gap-2 mb-6">
          {[0, 3, 6, 10].map((value) => (
            <button
              key={value}
              onClick={() => setWeight(value)}
              className={`py-2 px-3 text-sm rounded border transition-colors ${
                weight === value
                  ? 'bg-gray-900 text-white border-gray-900'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              {value}
            </button>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 px-4 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            disabled={isLoading}
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={isLoading}
            className="flex-1 py-3 px-4 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </div>
    </div>
  )
}
