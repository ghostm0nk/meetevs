import { useState, useEffect } from 'react'
import { ArrowLeft, Heart, MessageCircle, Send, Trash2, Star } from 'lucide-react'
import supabase from '../lib/supabase'

export default function EntryDetailPage({ onNavigate, entryId, user }) {
  const [entry, setEntry] = useState(null)
  const [reviews, setReviews] = useState([])
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [newReviewRating, setNewReviewRating] = useState(5)
  const [newReviewText, setNewReviewText] = useState('')
  const [newCommentText, setNewCommentText] = useState('')
  const [submittingReview, setSubmittingReview] = useState(false)
  const [submittingComment, setSubmittingComment] = useState(false)
  const [likedReviewId, setLikedReviewId] = useState(null)

  useEffect(() => {
    fetchEntryDetails()
  }, [entryId])

  const fetchEntryDetails = async () => {
    setLoading(true)
    setError('')
    try {
      const { data: entryData, error: entryError } = await supabase
        .from('ev_entries')
        .select('*')
        .eq('id', entryId)
        .single()

      if (entryError) throw new Error(entryError.message)
      setEntry(entryData)

      // Fetch reviews
      const { data: reviewsData, error: reviewsError } = await supabase
        .from('reviews')
        .select('*')
        .eq('entry_id', entryId)
        .order('created_at', { ascending: false })

      if (!reviewsError) setReviews(reviewsData || [])

      // Fetch comments
      const { data: commentsData, error: commentsError } = await supabase
        .from('comments')
        .select('*')
        .eq('entry_id', entryId)
        .order('created_at', { ascending: false })

      if (!commentsError) setComments(commentsData || [])
    } catch (err) {
      setError(err.message)
      console.error('Error fetching entry details:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleAddReview = async () => {
    if (!user) {
      alert('Please sign in to leave a review')
      return
    }

    if (!newReviewText.trim()) {
      alert('Please enter a review')
      return
    }

    setSubmittingReview(true)
    try {
      const { data, error: insertError } = await supabase
        .from('reviews')
        .insert([
          {
            entry_id: entryId,
            user_id: user.id,
            rating: newReviewRating,
            text: newReviewText,
          },
        ])
        .select()

      if (insertError) throw new Error(insertError.message)

      setReviews([data[0], ...reviews])
      setNewReviewText('')
      setNewReviewRating(5)
    } catch (err) {
      alert('Error adding review: ' + err.message)
    } finally {
      setSubmittingReview(false)
    }
  }

  const handleAddComment = async () => {
    if (!user) {
      alert('Please sign in to leave a comment')
      return
    }

    if (!newCommentText.trim()) {
      alert('Please enter a comment')
      return
    }

    setSubmittingComment(true)
    try {
      const { data, error: insertError } = await supabase
        .from('comments')
        .insert([
          {
            entry_id: entryId,
            user_id: user.id,
            text: newCommentText,
          },
        ])
        .select()

      if (insertError) throw new Error(insertError.message)

      setComments([data[0], ...comments])
      setNewCommentText('')
    } catch (err) {
      alert('Error adding comment: ' + err.message)
    } finally {
      setSubmittingComment(false)
    }
  }

  const handleDeleteReview = async (reviewId) => {
    if (!confirm('Delete this review?')) return

    try {
      const { error: deleteError } = await supabase
        .from('reviews')
        .delete()
        .eq('id', reviewId)

      if (deleteError) throw new Error(deleteError.message)
      setReviews(reviews.filter((r) => r.id !== reviewId))
    } catch (err) {
      alert('Error deleting review: ' + err.message)
    }
  }

  const handleDeleteComment = async (commentId) => {
    if (!confirm('Delete this comment?')) return

    try {
      const { error: deleteError } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId)

      if (deleteError) throw new Error(deleteError.message)
      setComments(comments.filter((c) => c.id !== commentId))
    } catch (err) {
      alert('Error deleting comment: ' + err.message)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-black to-slate-900">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-12 bg-white/10 rounded-2xl w-32"></div>
            <div className="h-64 bg-white/10 rounded-3xl"></div>
            <div className="h-40 bg-white/10 rounded-3xl"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!entry) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-black to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Entry not found</h1>
          <button
            onClick={() => onNavigate('browse')}
            className="px-6 py-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold hover:scale-105 transition-all"
          >
            Back to Browse
          </button>
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
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-8">
        {/* Back Button */}
        <button
          onClick={() => onNavigate('browse')}
          className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors mb-8 group"
        >
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span>Back to Browse</span>
        </button>

        {/* Entry Header */}
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-8 mb-8 shadow-2xl">
          <div className="inline-block mb-4 px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-500/50 text-cyan-300 text-xs font-semibold uppercase">
            {entry.category === 'future' ? '🚀 Future Project' : entry.category}
          </div>

          <h1 className="text-4xl font-bold text-white mb-2">{entry.title}</h1>
          <p className="text-lg text-gray-400 mb-6">{entry.manufacturer}</p>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="backdrop-blur-lg bg-white/5 border border-white/10 rounded-2xl p-4">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                Category
              </p>
              <p className="text-white font-semibold">{entry.category}</p>
            </div>
            <div className="backdrop-blur-lg bg-white/5 border border-white/10 rounded-2xl p-4">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                Created
              </p>
              <p className="text-white font-semibold">
                {new Date(entry.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>

          <p className="text-gray-300 leading-relaxed text-lg">
            {entry.description}
          </p>
        </div>

        {/* Reviews Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <Star size={24} className="text-yellow-400" />
            Reviews ({reviews.length})
          </h2>

          {/* Add Review Form */}
          {user && (
            <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-6 mb-6 shadow-lg">
              <h3 className="text-white font-semibold mb-4">Leave a Review</h3>

              {/* Rating */}
              <div className="mb-4">
                <label className="block text-sm text-gray-300 mb-2">Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      onClick={() => setNewReviewRating(rating)}
                      className={`p-2 rounded-full transition-all ${
                        rating <= newReviewRating
                          ? 'bg-yellow-400/30 text-yellow-300'
                          : 'bg-white/10 text-gray-400 hover:bg-white/20'
                      }`}
                    >
                      <Star size={20} fill={rating <= newReviewRating} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Review Text */}
              <textarea
                value={newReviewText}
                onChange={(e) => setNewReviewText(e.target.value)}
                placeholder="Share your experience with this EV..."
                className="w-full p-4 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 resize-none h-24 mb-4"
              />

              <button
                onClick={handleAddReview}
                disabled={submittingReview || !newReviewText.trim()}
                className="w-full px-6 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:from-gray-500 disabled:to-gray-600 text-white font-semibold transition-all duration-300 hover:scale-105 active:scale-95 disabled:scale-100 disabled:cursor-not-allowed"
              >
                {submittingReview ? 'Posting...' : 'Post Review'}
              </button>
            </div>
          )}

          {/* Reviews List */}
          {reviews.length > 0 ? (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div
                  key={review.id}
                  className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-6"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex gap-1 mb-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={14}
                            className={
                              i < review.rating
                                ? 'text-yellow-400'
                                : 'text-gray-600'
                            }
                            fill={i < review.rating ? 'currentColor' : 'none'}
                          />
                        ))}
                      </div>
                      <p className="text-xs text-gray-400">
                        {new Date(review.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    {user && user.id === review.user_id && (
                      <button
                        onClick={() => handleDeleteReview(review.id)}
                        className="text-red-400 hover:text-red-300 transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                  <p className="text-gray-300">{review.text}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400">
              <p>No reviews yet. Be the first to review this EV!</p>
            </div>
          )}
        </div>

        {/* Comments Section */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <MessageCircle size={24} className="text-cyan-400" />
            Discussion ({comments.length})
          </h2>

          {/* Add Comment Form */}
          {user && (
            <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-6 mb-6 shadow-lg">
              <div className="flex gap-4">
                <input
                  type="text"
                  value={newCommentText}
                  onChange={(e) => setNewCommentText(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      handleAddComment()
                    }
                  }}
                  placeholder="Join the conversation..."
                  className="flex-1 px-4 py-3 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-400/50"
                />
                <button
                  onClick={handleAddComment}
                  disabled={submittingComment || !newCommentText.trim()}
                  className="px-4 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:from-gray-500 disabled:to-gray-600 text-white font-semibold transition-all duration-300 hover:scale-105 active:scale-95 disabled:scale-100 disabled:cursor-not-allowed"
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          )}

          {/* Comments List */}
          {comments.length > 0 ? (
            <div className="space-y-4">
              {comments.map((comment) => (
                <div
                  key={comment.id}
                  className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-6"
                >
                  <div className="flex items-start justify-between mb-2">
                    <p className="text-xs text-gray-400">
                      {new Date(comment.created_at).toLocaleDateString()}
                    </p>
                    {user && user.id === comment.user_id && (
                      <button
                        onClick={() => handleDeleteComment(comment.id)}
                        className="text-red-400 hover:text-red-300 transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                  <p className="text-gray-300">{comment.text}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400">
              <p>No comments yet. Start the conversation!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
