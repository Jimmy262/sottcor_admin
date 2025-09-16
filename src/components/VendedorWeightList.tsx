'use client'

import { useState } from 'react'
import WeightModal from './WeightModal'

interface Vendedor {
  user_id: number
  user_name: string
  inbox_id: number
  inbox_name: string
  peso: number
}

interface VendedorWeightListProps {
  vendedores: Vendedor[]
  onUpdateWeight: (vendedorId: number, newWeight: number) => void
}

export default function VendedorWeightList({ vendedores, onUpdateWeight }: VendedorWeightListProps) {
  const [selectedVendedor, setSelectedVendedor] = useState<Vendedor | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const getWeightColorClass = (peso: number) => {
    if (peso === 0) return 'bg-gray-100 text-gray-600'
    if (peso <= 3) return 'bg-green-100 text-green-700'
    if (peso <= 6) return 'bg-blue-100 text-blue-700'
    if (peso <= 9) return 'bg-purple-100 text-purple-700'
    return 'bg-red-100 text-red-700'
  }

  const getWeightLabel = (peso: number) => {
    if (peso === 0) return 'Sin asignar'
    if (peso <= 3) return 'Ligero'
    if (peso <= 6) return 'Medio'
    if (peso <= 9) return 'Pesado'
    return 'Máximo'
  }

  const getProgressBarColor = (peso: number) => {
    if (peso === 0) return 'bg-gray-300'
    if (peso <= 3) return 'bg-gradient-to-r from-green-400 to-green-500'
    if (peso <= 6) return 'bg-gradient-to-r from-blue-400 to-blue-500'
    if (peso <= 9) return 'bg-gradient-to-r from-purple-400 to-purple-500'
    return 'bg-gradient-to-r from-red-400 to-red-500'
  }

  const handleEditWeight = (vendedor: Vendedor) => {
    setSelectedVendedor(vendedor)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setSelectedVendedor(null)
    setIsModalOpen(false)
  }

  const handleSaveWeight = (vendedorId: number, newWeight: number) => {
    onUpdateWeight(vendedorId, newWeight)
  }

  if (vendedores.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-600 text-4xl mb-4">👥</div>
        <p className="text-gray-700 text-lg">No hay vendedores registrados</p>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-3">
        {vendedores.map((vendedor) => (
          <div
            key={vendedor.user_id}
            className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
            onClick={() => handleEditWeight(vendedor)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {vendedor.user_name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">
                    {vendedor.user_name}
                  </h3>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-700">
                  Peso: {vendedor.peso}
                </span>
                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </div>
        ))}
      </div>

      <WeightModal
        vendedor={selectedVendedor}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveWeight}
      />
    </>
  )
}
