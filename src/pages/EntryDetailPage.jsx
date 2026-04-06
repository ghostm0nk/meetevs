import { useState, useEffect } from 'react'
import { ChevronLeft, Heart, Share2, MapPin, Zap, Gauge, Bolt, DollarSign, AlertCircle } from 'lucide-react'
import supabase from '../lib/supabase'

export default function EntryDetailPage({ onNavigate, user, carId }) {
  const [car, setCar] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isFavorited, setIsFavorited] = useState(false)
  const [reviews, setReviews] = useState([])
  const [newReview, setNewReview] = useState('')
  const [reviewRating, setReviewRating] = useState(5)
  const [submittingReview, setSubmittingReview] = useState(false)

  useEffect(() => {
    fetchCarDetails()
    if (user) {
      checkFavorite()
      fetchReviews()
    }
  }, [carId, user])

  const fetchCarDetails = async () => {
    setLoading(true)
    setError('')
    try {
      const { data, error: fetchError } = await supabase
        .from('cars')
        .select('*')
        .eq('id', carId)
        .single()

      if (fetchError) throw new Error(fetchError.message)
      setCar(data)
    } catch (err) {
      setError(err.message)
      console.error('Error fetching car details:', err)
    } finally {
      setLoading(false)
    }
  }

  const checkFavorite = async () => {
    try {
      const { data } = await supabase
        .from('favorites')
        .select('id')
        .eq('car_id', carId)
        .eq('user_id', user.id)
        .maybeSingle()

      setIsFavorited(!!data)
    } catch (err) {
      console.error('Error checking favorite:', err)
    }
  }

  const toggleFavorite = async () => {
    if (!user) {
      onNavigate('login')
      return
    }

    try {
      if (isFavorited) {
        await supabase
          .from('favorites')
          .delete()
          .eq('car_id', carId)
          .eq('user_id', user.id)
      } else {
        await supabase
          .from('favorites')
          .insert([{ car_id: carId, user_id: user.id }])
      }
      setIsFavorited(!isFavorited)
    } catch (err) {
      console.error('Error toggling favorite:', err)
    }
  }

  const fetchReviews = async () => {
    try {
      const { data } = await supabase
        .from('reviews')
        .select(`
          id,
          rating,
          comment,
          created_at,
          user:user_id(id, full_name, email)
        `)
        .eq('car_id', carId)
        .order('created_at', { ascending: false })

      setReviews(data || [])
    } catch (err) {
      console.error('Error fetching reviews:', err)
    }
  }

  const submitReview = async () => {
    if (!user || !newReview.trim()) return

    setSubmittingReview(true)
    try {
      const { error: insertError } = await supabase
        .from('reviews')
        .insert([
          {
            car_id: carId,
            user_id: user.id,
            rating: reviewRating,
            comment: newReview.trim(),
          },
        ])

      if (insertError) throw insertError

      setNewReview('')
      setReviewRating(5)
      fetchReviews()
    } catch (err) {
      console.error('Error submitting review:', err)
    } finally {
      setSubmittingReview(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-black to-slate-900">
        <div className="fixed inset-0 -z-10 overflow-hidden">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/20 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{animationDelay: '2s'}}></div>
        </div>
        <div className="relative z-10 max-w-4xl mx-auto px-4 py-12">
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-8 h-96 animate-pulse"></div>
        </div>
      </div>
    )
  }

  if (error || !car) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-black to-slate-900">
        <div className="relative z-10 max-w-4xl mx-auto px-4 py-12">
          <button
            onClick={() => onNavigate('browse')}
            className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 mb-8 transition-colors"
          >
            <ChevronLeft size={20} />
            Back to Browse
          </button>
          <div className="backdrop-blur-xl bg-red-500/20 border border-red-500/50 rounded-3xl p-8 text-red-100">
            <div className="flex gap-4">
              <AlertCircle className="flex-shrink-0" size={24} />
              <div>
                <p className="font-bold text-lg">Error</p>
                <p className="mt-2">{error || 'Car not found'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-black to-slate-900">
      {/* Background mesh gradients */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/20 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-1/2 right-0 w-80 h-80 bg-violet-500/20 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{animationDelay: '4s'}}></div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-12">
        {/* Back Button */}
        <button
          onClick={() => onNavigate('browse')}
          className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 mb-8 transition-colors font-semibold"
        >
          <ChevronLeft size={20} />
          Back to Browse
        </button>

        {/* Main Card */}
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl overflow-hidden shadow-2xl">
          {/* Hero Image */}
          <div className="relative w-full h-96 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 overflow-hidden">
            {car.image_url && (
              <img
                src={car.image_url}
                alt={`${car.manufacturer} ${car.name}`}
                className="w-full h-full object-cover"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>

            {/* Header Overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-8">
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-gray-300 text-lg">New Electric Vehicle</p>
                  <h1 className="text-5xl font-bold text-white mt-2">
                    {car.manufacturer} <span className="text-cyan-400">{car.name}</span>
                  </h1>
                  <p className="text-gray-400 mt-2 text-lg">{car.model_year}</p>
                </div>
                {user && (
                  <button
                    onClick={toggleFavorite}
                    className="p-4 rounded-full backdrop-blur-xl bg-white/10 border border-white/20 hover:bg-white/20 transition-all"
                  >
                    <Heart
                      size={28}
                      className={`transition-colors ${
                        isFavorited ? 'fill-red-500 text-red-500' : 'text-gray-400 hover:text-red-500'
                      }`}
                    />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Content Sections */}
          <div className="p-8 space-y-8">
            {/* Price & Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {car.price_usd && (
                <div className="backdrop-blur-xl bg-white/5 border border-white/20 rounded-2xl p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <DollarSign className="text-cyan-400" size={20} />
                    <span className="text-gray-400">Starting Price</span>
                  </div>
                  <p className="text-3xl font-bold text-cyan-400">
                    ${car.price_usd.toLocaleString()}
                  </p>
                </div>
              )}
              {car.type && (
                <div className="backdrop-blur-xl bg-white/5 border border-white/20 rounded-2xl p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <Gauge className="text-blue-400" size={20} />
                    <span className="text-gray-400">Vehicle Type</span>
                  </div>
                  <p className="text-2xl font-bold text-blue-400">{car.type}</p>
                </div>
              )}
            </div>

            {/* Detailed Specifications */}
            <div>
              <h2 className="text-2xl font-bold text-white mb-4">Specifications</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {car.range_km && (
                  <div className="backdrop-blur-xl bg-white/5 border border-white/20 rounded-2xl p-6">
                    <div className="flex items-center gap-2 mb-2">
                      <Zap className="text-yellow-400" size={18} />
                      <span className="text-gray-400 font-semibold">Range</span>
                    </div>
                    <p className="text-2xl font-bold text-white">{car.range_km} km</p>
                    <p className="text-xs text-gray-500 mt-1">EPA/WLTP estimated</p>
                  </div>
                )}

                {car.battery_kwh && (
                  <div className="backdrop-blur-xl bg-white/5 border border-white/20 rounded-2xl p-6">
                    <div className="flex items-center gap-2 mb-2">
                      <Bolt className="text-blue-400" size={18} />
                      <span className="text-gray-400 font-semibold">Battery</span>
                    </div>
                    <p className="text-2xl font-bold text-white">{car.battery_kwh} kWh</p>
                    <p className="text-xs text-gray-500 mt-1">Total capacity</p>
                  </div>
                )}

                {car.acceleration_0_100 && (
                  <div className="backdrop-blur-xl bg-white/5 border border-white/20 rounded-2xl p-6">
                    <div className="flex items-center gap-2 mb-2">
                      <Zap className="text-cyan-400" size={18} />
                      <span className="text-gray-400 font-semibold">0-100 km/h</span>
                    </div>
                    <p className="text-2xl font-bold text-white">{car.acceleration_0_100}s</p>
                    <p className="text-xs text-gray-500 mt-1">Acceleration time</p>
                  </div>
                )}

                {car.top_speed && (
                  <div className="backdrop-blur-xl bg-white/5 border border-white/20 rounded-2xl p-6">
                    <div className="flex items-center gap-2 mb-2">
                      <Gauge className="text-purple-400" size={18} />
                      <span className="text-gray-400 font-semibold">Top Speed</span>
                    </div>
                    <p className="text-2xl font-bold text-white">{car.top_speed} km/h</p>
                    <p className="text-xs text-gray-500 mt-1">Maximum speed</p>
                  </div>
                )}

                {car.charging_time_fast && (
                  <div className="backdrop-blur-xl bg-white/5 border border-white/20 rounded-2xl p-6">
                    <div className="flex items-center gap-2 mb-2">
                      <Bolt className="text-green-400" size={18} />
                      <span className="text-gray-400 font-semibold">Fast Charge</span>
                    </div>
                    <p className="text-2xl font-bold text-white">{car.charging_time_fast}</p>
                    <p className="text-xs text-gray-500 mt-1">10-80% DC fast charging</p>
                  </div>
                )}

                {car.seating && (
                  <div className="backdrop-blur-xl bg-white/5 border border-white/20 rounded-2xl p-6">
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className="text-orange-400" size={18} />
                      <span className="text-gray-400 font-semibold">Seating</span>
                    </div>
                    <p className="text-2xl font-bold text-white">{car.seating} Seats</p>
                    <p className="text-xs text-gray-500 mt-1">Passenger capacity</p>
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            {car.description && (
              <div>
                <h2 className="text-2xl font-bold text-white mb-4">About</h2>
                <p className="text-gray-300 leading-relaxed">{car.description}</p>
              </div>
            )}

            {/* Reviews Section */}
            <div className="border-t border-white/10 pt-8">
              <h2 className="text-2xl font-bold text-white mb-6">Community Reviews</h2>

              {/* Add Review Form */}
              {user ? (
                <div className="mb-8 backdrop-blur-xl bg-white/5 border border-white/20 rounded-2xl p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Share Your Experience</h3>

                  {/* Rating Selector */}
                  <div className="mb-4">
                    <label className="block text-gray-400 text-sm font-semibold mb-2">
                      Rating
                    </label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => setReviewRating(star)}
                          className={`text-2xl transition-colors ${
                            star <= reviewRating ? 'text-yellow-400' : 'text-gray-600'
                          }`}
                        >
                          ★
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Review Text */}
                  <textarea
                    value={newReview}
                    onChange={(e) => setNewReview(e.target.value)}
                    placeholder="What do you think about this EV? Share your thoughts..."
                    className="w-full px-4 py-3 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-gray-500 focus:ring-2 focus:ring-cyan-500 outline-none resize-none"
                    rows={4}
                  />

                  {/* Submit Button */}
                  <button
                    onClick={submitReview}
                    disabled={submittingReview || !newReview.trim()}
                    className="mt-4 px-6 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submittingReview ? 'Posting...' : 'Post Review'}
                  </button>
                </div>
              ) : (
                <div className="mb-8 backdrop-blur-xl bg-blue-500/20 border border-blue-500/50 rounded-2xl p-6 text-center">
                  <p className="text-blue-100 font-semibold">
                    Sign in to leave a review
                  </p>
                  <button
                    onClick={() => onNavigate('login')}
                    className="mt-4 px-6 py-2 rounded-2xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors"
                  >
                    Sign In
                  </button>
                </div>
              )}

              {/* Reviews List */}
              <div className="space-y-4">
                {reviews.length > 0 ? (
                  reviews.map((review) => (
                    <div
                      key={review.id}
                      className="backdrop-blur-xl bg-white/5 border border-white/20 rounded-2xl p-6"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="text-white font-semibold">
                            {review.user?.full_name || 'Anonymous'}
                          </p>
                          <div className="flex gap-1 mt-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <span
                                key={star}
                                className={star <= review.rating ? 'text-yellow-400' : 'text-gray-600'}
                              >
                                ★
                              </span>
                            ))}
                          </div>
                        </div>
                        <p className="text-xs text-gray-500">
                          {new Date(review.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <p className="text-gray-300">{review.comment}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-gray-500 py-8">
                    No reviews yet. Be the first to share your thoughts!
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
