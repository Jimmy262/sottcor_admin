'use client'

import { memo, useMemo } from 'react'

interface Vendedor {
  user_id: number
  user_name: string
  inbox_id: number
  inbox_name: string
  peso: number
}

interface WeightDistributionProps {
  vendedores: Vendedor[]
}

function WeightDistribution({ vendedores }: WeightDistributionProps) {
  // Memoizar cálculos pesados
  const { totalWeight, vendedoresWithPercentage, avgWeight } = useMemo(() => {
    const total = vendedores.reduce((sum, v) => sum + v.peso, 0)

    const withPercentage = vendedores
      .filter(v => v.peso > 0)
      .map(vendedor => ({
        ...vendedor,
        percentage: total > 0 ? (vendedor.peso / total) * 100 : 0
      }))
      .sort((a, b) => b.peso - a.peso)

    const avg = withPercentage.length > 0 ? total / withPercentage.length : 0

    return {
      totalWeight: total,
      vendedoresWithPercentage: withPercentage,
      avgWeight: avg
    }
  }, [vendedores])

  if (vendedores.length === 0 || totalWeight === 0) {
    return null
  }

  return (
    <div className="border border-gray-200 rounded-lg p-6 mb-6">
      <h3 className="text-sm font-medium text-gray-700 mb-4">
        Distribución de Pesos ({totalWeight} total)
      </h3>

      {/* Barra de distribución visual */}
      <div className="flex w-full h-6 bg-gray-100 rounded-lg overflow-hidden mb-4">
        {vendedoresWithPercentage.map((vendedor, index) => (
          <div
            key={vendedor.user_id}
            className={`h-full flex items-center justify-center text-xs font-medium text-white ${
              index % 4 === 0 ? 'bg-blue-600' :
              index % 4 === 1 ? 'bg-green-600' :
              index % 4 === 2 ? 'bg-purple-600' : 'bg-orange-600'
            }`}
            style={{ width: `${vendedor.percentage}%` }}
            title={`${vendedor.user_name}: ${vendedor.peso} (${vendedor.percentage.toFixed(1)}%)`}
          >
            {vendedor.percentage >= 8 && (
              <span className="truncate px-1">
                {vendedor.user_name.split(' ')[0]}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Lista detallada */}
      <div className="space-y-2">
        {vendedoresWithPercentage.map((vendedor, index) => (
          <div key={vendedor.user_id} className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-2">
              <div
                className={`w-3 h-3 rounded-full ${
                  index % 4 === 0 ? 'bg-blue-600' :
                  index % 4 === 1 ? 'bg-green-600' :
                  index % 4 === 2 ? 'bg-purple-600' : 'bg-orange-600'
                }`}
              />
              <span className="text-gray-700">{vendedor.user_name}</span>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-gray-700 font-mono">
                {vendedor.peso}
              </span>
              <span className="text-gray-900 font-medium w-12 text-right">
                {vendedor.percentage.toFixed(1)}%
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Estadística adicional */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-700">Vendedores activos:</span>
            <span className="ml-2 font-medium text-gray-900">{vendedoresWithPercentage.length}</span>
          </div>
          <div>
            <span className="text-gray-700">Peso promedio:</span>
            <span className="ml-2 font-medium text-gray-900">
              {avgWeight.toFixed(1)}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default memo(WeightDistribution)