import React from 'react'
import { Home, LogOut, User } from 'lucide-react'

const Header = ({ session, onLogout, onHomeClick }) => {
  return (
    <header className="bg-gray-800 border-b border-gray-700">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <button
            onClick={onHomeClick}
            className="flex items-center space-x-2 text-white hover:text-blue-400 transition-colors"
          >
            <Home className="w-6 h-6" />
            <span className="text-xl font-bold">meetEVs</span>
          </button>
          
          {session && (
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-gray-300">
                <User className="w-5 h-5" />
                <span className="text-sm">{session.user.email}</span>
              </div>
              <button
                onClick={onLogout}
                className="flex items-center space-x-1 text-gray-400 hover:text-white transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span className="text-sm">Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header
