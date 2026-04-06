import { useState } from 'react'
import { ArrowLeft, Plus } from 'lucide-react'
import supabase from '../lib/supabase'

export default function CreateEntryPage({ onNavigate, user }) {
  const [title, setTitle] = useState('')
  const [manufacturer, setManufacturer] = useState('')
  const [category, setCategory] = useState('current')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!title.trim() || !manufacturer.trim() || !description.trim()) {
      setError('Please fill in all fields')
      return
    }

    if (!user) {
      setError('You must be signed in to create an entry')
      return
    }

    setLoading(true)
    try {
      const { data, error: insertError } = await supabase
        .from('ev_entries')
        .insert([
          {
            title,
            manufacturer,
            category,
            description,
            user_id: user.id,
          },
        ])
        .select()

      if (insertError) throw new Error(insertError.message)

      // Reset form
      setTitle('')
      setManufacturer('')
      setCategory('current')
      setDescription('')

      // Navigate to the new entry
      onNavigate('entry', { entryId: data[0].id })
    } catch (err) {
      setError(err.message)
      console.error('Error creating entry:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-black to-slate-900">
      {/* Background mesh gradients */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 right-1/3 w-96 h-96 bg-blue-500/20 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-violet-500/20 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>

      <div className="relative z-10 max-w-3xl mx-auto px-4 py-8">
        {/* Back Button */}
        <button
          onClick={() => onNavigate('browse')}
          className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors mb-8 group"
        >
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span>Back to Browse</span>
        </button>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600">
              <Plus size={28} className="text-white" />
            </div>
            New EV Entry
          </h1>
          <p className="text-gray-400">Add a new electric vehicle or future EV project to the wiki</p>
        </div>

        {/* Form Card */}
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-8 shadow-2xl">
          {error && (
            <div className="mb-6 p-4 rounded-2xl bg-red-500/20 border border-red-500/50 text-red-300">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-semibold text-white mb-2">
                Vehicle Name *
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Tesla Model S, BMW i7"
                className="w-full px-6 py-4 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 transition-all"
              />
            </div>

            {/* Manufacturer */}
            <div>
              <label htmlFor="manufacturer" className="block text-sm font-semibold text-white mb-2">
                Manufacturer *
              </label>
              <input
                id="manufacturer"
                type="text"
                value={manufacturer}
                onChange={(e) => setManufacturer(e.target.value)}
                placeholder="e.g., Tesla, BMW, Ford"
                className="w-full px-6 py-4 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 transition-all"
              />
            </div>

            {/* Category */}
            <div>
              <label htmlFor="category" className="block text-sm font-semibold text-white mb-2">
                Category *
              </label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-6 py-4 rounded-2xl bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-cyan-400/50 transition-all appearance-none cursor-pointer"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23fff' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 1.5rem center',
                  paddingRight: '3rem',
                }}
              >
                <option value="current" className="bg-slate-900">
                  Current Models (Available Now)
                </option>
                <option value="upcoming" className="bg-slate-900">
                  Upcoming Models (2024-2025)
                </option>
                <option value="future" className="bg-slate-900">
                  Future Projects (Concept)
                </option>
              </select>
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-semibold text-white mb-2">
                Description *
              </label>
              <p className="text-xs text-gray-400 mb-2">
                Include specs, features, release date, and what makes it special
              </p>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter a detailed description of this electric vehicle..."
                className="w-full px-6 py-4 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 transition-all resize-none h-48"
              />
              <p className="text-xs text-gray-400 mt-2">
                {description.length} characters
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !title.trim() || !manufacturer.trim() || !description.trim()}
              className="w-full px-6 py-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:from-gray-500 disabled:to-gray-600 text-white font-semibold transition-all duration-300 hover:scale-105 active:scale-95 disabled:scale-100 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Creating...
                </>
              ) : (
                <>
                  <Plus size={20} />
                  Create Entry
                </>
              )}
            </button>
          </form>
        </div>

        {/* Info Box */}
        <div className="mt-8 backdrop-blur-lg bg-white/5 border border-white/10 rounded-2xl p-6">
          <h3 className="text-white font-semibold mb-3">📋 Guidelines</h3>
          <ul className="space-y-2 text-sm text-gray-400">
            <li className="flex gap-2">
              <span className="text-cyan-400 font-bold">•</span>
              <span>Be accurate and informative about specifications</span>
            </li>
            <li className="flex gap-2">
              <span className="text-cyan-400 font-bold">•</span>
              <span>Include price range and availability information</span>
            </li>
            <li className="flex gap-2">
              <span className="text-cyan-400 font-bold">•</span>
              <span>Community members can review and comment on your entry</span>
            </li>
            <li className="flex gap-2">
              <span className="text-cyan-400 font-bold">•</span>
              <span>Keep descriptions factual and professional</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
