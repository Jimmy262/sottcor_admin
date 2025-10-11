'use client'

import { useAuth } from '@/contexts/AuthContext'

interface HeaderProps {
  breadcrumbs?: { label: string; active?: boolean }[]
}

export default function Header({ breadcrumbs }: HeaderProps = {}) {
  const { logout } = useAuth()

  const handleLogout = async () => {
    if (confirm('¿Cerrar sesión?')) {
      await logout()
    }
  }

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="max-w-6xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Sottcor Admin</h1>
            {breadcrumbs && breadcrumbs.length > 0 && (
              <nav className="flex items-center space-x-2 mt-1 text-sm">
                <span className="text-gray-600">Inicio</span>
                {breadcrumbs.map((crumb, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    <span className={crumb.active ? 'text-gray-900 font-medium' : 'text-gray-600'}>
                      {crumb.label}
                    </span>
                  </div>
                ))}
              </nav>
            )}
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 text-sm transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span>Cerrar sesión</span>
          </button>
        </div>
      </div>
    </header>
  )
}