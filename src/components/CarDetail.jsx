import React, { useState, useEffect } from 'react'
import { ArrowLeft, Star, Calendar, Battery, User, Edit3 } from 'lucide-react'

const CarDetail = ({ car, onBack, onEditReview, currentUserId, supabase }) => {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Mock reviews data
    const mockReviews = [
      {
        id: 1,
        user_id: 'user1',
        username: 'John Doe',
        rating: 5,
        comment: 'Amazing car! The range is fantastic and charging is super fast.',
        created_at: '2023-12-01'
      },
      {
        id: 2,
        user_id: 'user2',
        username: 'Jane Smith',
        rating: 4,
        comment: 'Great build quality and comfortable ride. Highly recommend!',
        created_at: '2023-11-28'
      }
    ]
    
    setTimeout(() => {
      setReviews(mockReviews)
      setLoading(false)
    }, 500)
  }, [car.id])

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-600'}`}
      />
    ))
  }

  return (
    <div>
      <button
        onClick={onBack}
        className="flex items-center space-x-2 text-gray-400 hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Back to EVs</span>
      </button>

      <div className="bg-gray-800 rounded-lg overflow-hidden">
        <img
          src={car.image_url}
          alt={`${car.make} ${car.model}`}
          className="w-full h-64 object-cover"
        />
        
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                {car.make} {car.model}
              </h1>
              <div className="flex items-center space-x-4 text-gray-400">
                <span className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>{car.year}</span>
                </span>
                <span className="flex items-center space-x-1">
                  <Battery className="w-4 h-4" />
                  <span>{car.range_km} km range</span>
                </span>
                <div className="flex items-center space-x-1">
                  {renderStars(Math.round(car.rating))}
                  <span className="ml-1">{car.rating}</span>
                  <span className="text-sm text-gray-500 ml-1">({car.reviews_count} reviews)</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Reviews</h2>
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors">
                <Edit3 className="w-4 h-4" />
                <span>Write Review</span>
              </button>
            </div>

            {loading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-400"></div>
              </div>
            ) : reviews.length > 0 ? (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div key={review.id} className="bg-gray-700 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center space-x-2">
                        <User className="w-5 h-5 text-gray-400" />
                        <span className="font-medium">{review.username}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="flex">{renderStars(review.rating)}</div>
                        {review.user_id === currentUserId && (
                          <button
                            onClick={() => onEditReview(review)}
                            className="text-blue-400 hover:text-blue-300"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                    <p className="text-gray-300 mb-2">{review.comment}</p>
                    <p className="text-xs text-gray-500">{review.created_at}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-center py-8">No reviews yet. Be the first to review!</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default CarDetail
