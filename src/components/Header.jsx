import { useState } from 'react'
import { Menu, X, LogOut } from 'lucide-react'
import supabase from '../lib/supabase'

export default function Header({ user, onNavigate, currentPage }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    onNavigate('login')
    setMobileMenuOpen(false)
  }

  const navLinks = [
    { label: 'Dashboard', page: 'dashboard' },
    { label: 'Create Entry', page: 'create-ev' },
    { label: 'Reviews', page: 'reviews' },
    { label: 'Profile', page: 'profile' },
  ]

  return (
    <header className="sticky top-0 z-50 bg-gradient-to-b from-black/80 to-black/40 backdrop-blur-xl border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <button
            onClick={() => onNavigate('dashboard')}
            className="flex items-center gap-3 group"
          >
            <div className="relative w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-xl flex items-center justify-center font-bold text-black text-lg group-hover:scale-110 transition-transform duration-300">
              ⚡
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-violet-500 bg-clip-text text-transparent">
              meetEVs
            </span>
          </button>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <button
                key={link.page}
                onClick={() => onNavigate(link.page)}
                className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
                  currentPage === link.page
                    ? 'bg-white/15 text-white border border-white/30'
                    : 'text-gray-300 hover:text-white hover:bg-white/10'
                }`}
              >
                {link.label}
              </button>
            ))}
          </nav>

          {/* Desktop Sign Out */}
          <button
            onClick={handleSignOut}
            className="hidden md:flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-red-500/80 to-pink-600/80 hover:from-red-500 hover:to-pink-600 text-white font-semibold transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg"
          >
            <LogOut size={18} />
            Sign Out
          </button>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-4 border-t border-white/10">
            <nav className="flex flex-col gap-2 mt-4">
              {navLinks.map((link) => (
                <button
                  key={link.page}
                  onClick={() => {
                    onNavigate(link.page)
                    setMobileMenuOpen(false)
                  }}
                  className={`px-4 py-3 rounded-xl font-medium text-left transition-all duration-300 ${
                    currentPage === link.page
                      ? 'bg-white/15 text-white border border-white/30'
                      : 'text-gray-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {link.label}
                </button>
              ))}
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-red-500/80 to-pink-600/80 hover:from-red-500 hover:to-pink-600 text-white font-semibold transition-all duration-300 mt-2"
              >
                <LogOut size={18} />
                Sign Out
              </button>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
