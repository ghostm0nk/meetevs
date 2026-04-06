import { useState, useEffect } from 'react'
import { Search, Filter, ChevronRight, ZapOff } from 'lucide-react'
import supabase from '../lib/supabase'

export default function BrowsePage({ onNavigate, user }) {
  const [entries, setEntries] = useState([])
  const [filteredEntries, setFilteredEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [error, setError] = useState('')

  const categories = [
    { id: 'all', label: 'All Vehicles', icon: '🚗' },
    { id: 'sedan', label: 'Sedans', icon: '🚙' },
    { id: 'suv', label: 'SUVs', icon: '🚙' },
    { id: 'truck', label: 'Trucks', icon: '🚚' },
    { id: 'future', label: 'Future Projects', icon: '🚀' },
  ]

  useEffect(() => {
    fetchEntries()
  }, [])

  const fetchEntries = async () => {
    setLoading(true)
    setError('')
    try {
      const { data, error: fetchError } = await supabase
        .from('ev_entries')
        .select('*')
        .order('created_at', { ascending: false })

      if (fetchError) throw new Error(fetchError.message)
      setEntries(data || [])
    } catch (err) {
      setError(err.message)
      console.error('Error fetching entries:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let results = entries

    // Filter by category
    if (selectedCategory !== 'all') {
      results = results.filter((e) => e.category === selectedCategory)
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      results = results.filter(
        (e) =>
          e.title.toLowerCase().includes(query) ||
          e.description.toLowerCase().includes(query) ||
          e.manufacturer.toLowerCase().includes(query)
      )
    }

    setFilteredEntries(results)
  }, [searchQuery, selectedCategory, entries])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-black to-slate-900">
      {/* Background mesh gradients */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/20 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-1/2 right-0 w-80 h-80 bg-violet-500/20 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{animationDelay: '4s'}}></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-12">
        {/* Header Section */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <ZapOff className="text-cyan-400" size={32} />
            <div>
              <h1 className="text-4xl font-bold text-white tracking-tight">
                Browse EVs
              </h1>
              <p className="text-gray-400 mt-1">
                Discover electric vehicles and community insights
              </p>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-6 shadow-2xl">
            <Search className="absolute left-8 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search vehicles, manufacturers, specs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-6 py-3 bg-transparent text-white placeholder-gray-500 focus:outline-none text-lg"
            />
          </div>
        </div>

        {/* Category Filter */}
        <div className="mb-8 flex items-center gap-3 overflow-x-auto pb-2">
          <Filter className="text-gray-400 flex-shrink-0" size={20} />
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-6 py-3 rounded-full whitespace-nowrap font-medium transition-all duration-300 flex-shrink-0 ${
                selectedCategory === cat.id
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg scale-105'
                  : 'backdrop-blur-xl bg-white/10 border border-white/20 text-gray-300 hover:bg-white/20'
              }`}
            >
              <span className="mr-2">{cat.icon}</span>
              {cat.label}
            </button>
          ))}
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-8 p-6 rounded-3xl bg-red-500/20 border border-red-500/50 text-red-100">
            <p className="font-semibold">Error loading entries</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl h-80 animate-pulse"
              ></div>
            ))}
          </div>
        )}

        {/* Entries Grid */}
        {!loading && filteredEntries.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEntries.map((entry) => (
              <button
                key={entry.id}
                onClick={() => onNavigate('entry-detail', { entryId: entry.id })}
                className="group text-left backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-6 hover:bg-white/20 hover:border-cyan-400/50 transition-all duration-300 hover:-translate-y-1 shadow-lg cursor-pointer"
              >
                {/* Category Badge */}
                <div className="inline-block mb-4 px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-500/50 text-cyan-300 text-xs font-semibold uppercase tracking-wider">
                  {entry.category === 'future' ? '🚀 Future' : entry.category}
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-cyan-300 transition-colors">
                  {entry.title}
                </h3>

                {/* Manufacturer */}
                <p className="text-sm text-gray-400 mb-3">{entry.manufacturer}</p>

                {/* Description */}
                <p className="text-gray-300 text-sm mb-4 line-clamp-2">
                  {entry.description}
                </p>

                {/* Stats */}
                <div className="flex gap-4 mb-4 text-xs text-gray-400">
                  <span>📊 Reviews</span>
                  <span>💬 Comments</span>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                  <span className="text-xs text-gray-500">
                    Created{' '}
                    {new Date(entry.created_at).toLocaleDateString()}
                  </span>
                  <ChevronRight className="text-cyan-400 group-hover:translate-x-1 transition-transform" size={16} />
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredEntries.length === 0 && (
          <div className="text-center py-16">
            <ZapOff className="mx-auto text-gray-600 mb-4" size={48} />
            <h3 className="text-2xl font-bold text-gray-300 mb-2">
              No entries found
            </h3>
            <p className="text-gray-500 mb-6">
              {searchQuery || selectedCategory !== 'all'
                ? 'Try adjusting your filters'
                : 'Start by creating a new entry'}
            </p>
            {user && (
              <button
                onClick={() => onNavigate('create-entry')}
                className="px-8 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg"
              >
                Create First Entry
              </button>
            )}
          </div>
        )}

        {/* Create Entry Button */}
        {user && filteredEntries.length > 0 && (
          <div className="mt-12 flex justify-center">
            <button
              onClick={() => onNavigate('create-entry')}
              className="px-8 py-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg"
            >
              + Add New Entry
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
