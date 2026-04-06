import { useState, useEffect } from 'react'
import supabase from './lib/supabase'
import Header from './components/Header'
import LoginPage from './pages/LoginPage'
import BrowsePage from './pages/BrowsePage'
import EntryDetailPage from './pages/EntryDetailPage'
import CreateEntryPage from './pages/CreateEntryPage'
import ProfilePage from './pages/ProfilePage'

export default function App() {
  const [session, setSession] = useState(null)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState('login')
  const [currentPageProps, setCurrentPageProps] = useState({})

  // Auth state listener
  useEffect(() => {
    const initAuth = async () => {
      try {
        const { data: { session: currentSession }, error } = await supabase.auth.getSession()
        if (error) throw error
        
        if (currentSession) {
          setSession(currentSession)
          setUser(currentSession.user)
          setCurrentPage('browse')
        } else {
          setCurrentPage('login')
        }
      } catch (err) {
        console.error('Auth error:', err)
        setCurrentPage('login')
      } finally {
        setLoading(false)
      }
    }

    initAuth()

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        if (newSession) {
          setSession(newSession)
          setUser(newSession.user)
          setCurrentPage('browse')
        } else {
          setSession(null)
          setUser(null)
          setCurrentPage('login')
        }
      }
    )

    return () => {
      subscription?.unsubscribe()
    }
  }, [])

  const handleNavigate = (page, props = {}) => {
    setCurrentPage(page)
    setCurrentPageProps(props || {})
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-black to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400 font-semibold">Loading meetEVs...</p>
        </div>
      </div>
    )
  }

  // Not authenticated - show login
  if (!session) {
    return (
      <LoginPage onNavigate={handleNavigate} />
    )
  }

  // Authenticated - show app with header
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-black to-slate-900">
      <Header onNavigate={handleNavigate} user={user} />
      
      {currentPage === 'browse' && (
        <BrowsePage onNavigate={handleNavigate} user={user} />
      )}
      
      {currentPage === 'entry-detail' && (
        <EntryDetailPage 
          onNavigate={handleNavigate} 
          user={user}
          entryId={currentPageProps.entryId}
        />
      )}
      
      {currentPage === 'create-entry' && (
        <CreateEntryPage onNavigate={handleNavigate} user={user} />
      )}
      
      {currentPage === 'profile' && (
        <ProfilePage onNavigate={handleNavigate} user={user} />
      )}
    </div>
  )
}
