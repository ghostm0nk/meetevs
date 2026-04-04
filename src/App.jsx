import React, { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import Header from './components/Header'
import Auth from './components/Auth'
import CarList from './components/CarList'
import CarDetail from './components/CarDetail'
import ReviewForm from './components/ReviewForm'
import { Car } from 'lucide-react'

const supabase = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY)

function App() {
  const [session, setSession] = useState(null)
  const [currentView, setCurrentView] = useState('home')
  const [selectedCar, setSelectedCar] = useState(null)
  const [editingReview, setEditingReview] = useState(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setSession(null)
    setCurrentView('home')
    setSelectedCar(null)
    setEditingReview(null)
  }

  const handleCarSelect = (car) => {
    setSelectedCar(car)
    setCurrentView('detail')
  }

  const handleBackToList = () => {
    setSelectedCar(null)
    setCurrentView('home')
    setEditingReview(null)
  }

  const handleEditReview = (review) => {
    setEditingReview(review)
    setCurrentView('review')
  }

  const handleReviewComplete = () => {
    setEditingReview(null)
    setCurrentView('detail')
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Header 
        session={session} 
        onLogout={handleLogout}
        onHomeClick={() => {
          setCurrentView('home')
          setSelectedCar(null)
          setEditingReview(null)
        }}
      />
      
      <main className="container mx-auto px-4 py-8">
        {!session ? (
          <div className="max-w-md mx-auto">
            <div className="text-center mb-8">
              <Car className="w-16 h-16 mx-auto mb-4 text-blue-400" />
              <h1 className="text-4xl font-bold mb-2">meetEVs</h1>
              <p className="text-gray-400">The future of electric vehicles</p>
            </div>
            <Auth />
          </div>
        ) : (
          <>
            {currentView === 'home' && (
              <CarList onCarSelect={handleCarSelect} supabase={supabase} />
            )}
            
            {currentView === 'detail' && selectedCar && (
              <CarDetail 
                car={selectedCar} 
                onBack={handleBackToList}
                onEditReview={handleEditReview}
                currentUserId={session.user.id}
                supabase={supabase}
              />
            )}
            
            {currentView === 'review' && (
              <ReviewForm
                car={selectedCar}
                review={editingReview}
                onComplete={handleReviewComplete}
                onCancel={() => setCurrentView('detail')}
                currentUserId={session.user.id}
                supabase={supabase}
              />
            )}
          </>
        )}
      </main>
    </div>
  )
}

export default App
