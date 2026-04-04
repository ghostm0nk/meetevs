import React, { useState } from 'react'
import { X, Star, Save } from 'lucide-react'

const ReviewForm = ({ car, review, onComplete, onCancel, currentUserId, supabase }) => {
  const [rating, setRating] = useState(review?.rating || 0)
  const [comment, setComment] = useState(review?.comment || '')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    // Mock submission - in real app, this would save to Supabase
    setTimeout(() => {
      setLoading(false)
      onComplete()
    }, 1000)
  }

  const renderStars = () => {
    return Array.from({ length: 5 }, (_, i) => (
      <button
        key={i}
        type="button"
        onClick={() => setRating(i + 1)}
        className="focus:outline-none"
      >
        <Star
          className={`w-8 h-8 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-600'} hover:text-yellow-400 transition-colors`}
        />
      </button>
    ))
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">
          {review ? 'Edit Review' : 'Write a Review'}
        </h2>
        <button
          onClick={onCancel}
          className="text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      <div className="bg-gray-800 rounded-lg p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4">
          {car.make} {car.model}
        </h3>
        <div className="flex items-center space-x-4 text-gray-400 text-sm">
          <span>{car.year}</span>
          <span>{car.range_km} km range</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-gray-800 rounded-lg p-6">
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Rating</label>
          <div className="flex space-x-2">{renderStars()}</div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Your Review</label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your experience with this EV..."
            rows={4}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-400 text-white resize-none"
            required
          />
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || rating === 0}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>{loading ? 'Saving...' : (review ? 'Update Review' : 'Submit Review')}</span>
          </button>
        </div>
      </form>
    </div>
  )
}

export default ReviewForm
