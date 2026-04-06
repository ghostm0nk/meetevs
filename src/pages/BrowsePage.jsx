import { useState, useEffect } from 'react'
import { Search, Filter, ChevronRight, ZapOff, Heart } from 'lucide-react'
import supabase from '../lib/supabase'

export default function BrowsePage({ onNavigate, user }) {
  const [cars, setCars] = useState([])
  const [filteredCars, setFilteredCars] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedType, setSelectedType] = useState('all')
  const [error, setError] = useState('')
  const [favorites, setFavorites] = useState(new Set())

  const carTypes = [
    { id: 'all', label: 'All Vehicles', icon: '🚗' },
    { id: 'Sedan', label: 'Sedans', icon: '🚙' },
    { id: 'SUV', label: 'SUVs', icon: '🚙' },
    { id: 'Truck', label: 'Trucks', icon: '🚚' },
    { id: 'Hatchback', label: 'Hatchbacks', icon: '🚕' },
  ]

  useEffect(() => {
    fetchCars()
    if (user) {
      fetchFavorites()
    }
  }, [user])

  const fetchCars = async () => {
    setLoading(true)
    setError('')
    try {
      const { data, error: fetchError } = await supabase
        .from('cars')
        .select('*')
        .order('created_at', { ascending: false })

      if (fetchError) throw new Error(fetchError.message)
      setCars(data || [])
    } catch (err) {
      setError(err.message)
      console.error('Error fetching cars:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchFavorites = async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('favorites')
        .select('car_id')
        .eq('user_id', user.id)

      if (fetchError) throw fetchError
      setFavorites(new Set(data?.map(fav => fav.car_id) || []))
    } catch (err) {
      console.error('Error fetching favorites:', err)
    }
  }

  const toggleFavorite = async (carId) => {
    if (!user) {
      onNavigate('login')
      return
    }

    const isFavorited = favorites.has(carId)

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

      const newFavorites = new Set(favorites)
      if (isFavorited) {
        newFavorites.delete(carId)
      } else {
        newFavorites.add(carId)
      }
      setFavorites(newFavorites)
    } catch (err) {
      console.error('Error toggling favorite:', err)
    }
  }

  useEffect(() => {
    let results = cars

    // Filter by type
    if (selectedType !== 'all') {
      results = results.filter((car) => car.type === selectedType)
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      results = results.filter(
        (car) =>
          car.name.toLowerCase().includes(query) ||
          car.manufacturer.toLowerCase().includes(query) ||
          (car.model_year && car.model_year.toString().includes(query))
      )
    }

    setFilteredCars(results)
  }, [searchQuery, selectedType, cars])

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
                Discover electric vehicles from our database and community reviews
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
              placeholder="Search by manufacturer, model, year..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-6 py-3 bg-transparent text-white placeholder-gray-500 focus:outline-none text-lg"
            />
          </div>
        </div>

        {/* Type Filter */}
        <div className="mb-8 flex items-center gap-3 overflow-x-auto pb-2">
          <Filter className="text-gray-400 flex-shrink-0" size={20} />
          {carTypes.map((type) => (
            <button
              key={type.id}
              onClick={() => setSelectedType(type.id)}
              className={`px-6 py-3 rounded-full whitespace-nowrap font-medium transition-all duration-300 flex-shrink-0 ${
                selectedType === type.id
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg scale-105'
                  : 'backdrop-blur-xl bg-white/10 border border-white/20 text-gray-300 hover:bg-white/20'
              }`}
            >
              <span className="mr-2">{type.icon}</span>
              {type.label}
            </button>
          ))}
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-8 p-6 rounded-3xl bg-red-500/20 border border-red-500/50 text-red-100">
            <p className="font-semibold">Error loading vehicles</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl h-96 animate-pulse"
              ></div>
            ))}
          </div>
        )}

        {/* Cars Grid */}
        {!loading && filteredCars.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCars.map((car) => (
              <div
                key={car.id}
                className="group backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl overflow-hidden hover:bg-white/20 hover:border-cyan-400/50 transition-all duration-300 hover:-translate-y-1 shadow-lg"
              >
                {/* Car Image */}
                <button
                  onClick={() => onNavigate('car-detail', { carId: car.id })}
                  className="w-full h-48 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 relative overflow-hidden cursor-pointer group/img"
                >
                  {car.image_url && (
                    <img
                      src={car.image_url}
                      alt={`${car.manufacturer} ${car.name}`}
                      className="w-full h-full object-cover group-hover/img:scale-110 transition-transform duration-300"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                </button>

                <div className="p-6">
                  {/* Header with Favorite */}
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="text-xl font-bold text-white">
                        {car.manufacturer}
                      </h3>
                      <p className="text-2xl font-bold text-cyan-400">
                        {car.name}
                      </p>
                    </div>
                    {user && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleFavorite(car.id)
                        }}
                        className="mt-1 p-2 rounded-full hover:bg-white/10 transition-colors"
                      >
                        <Heart
                          size={20}
                          className={`transition-colors ${
                            favorites.has(car.id)
                              ? 'fill-red-500 text-red-500'
                              : 'text-gray-400 hover:text-red-500'
                          }`}
                        />
                      </button>
                    )}
                  </div>

                  {/* Year and Type */}
                  <div className="flex gap-2 mb-4">
                    {car.model_year && (
                      <span className="inline-block px-2 py-1 rounded-full bg-blue-500/20 border border-blue-500/50 text-blue-300 text-xs font-semibold">
                        {car.model_year}
                      </span>
                    )}
                    {car.type && (
                      <span className="inline-block px-2 py-1 rounded-full bg-cyan-500/20 border border-cyan-500/50 text-cyan-300 text-xs font-semibold">
                        {car.type}
                      </span>
                    )}
                  </div>

                  {/* Key Specs */}
                  <div className="space-y-2 mb-4">
                    {car.range_km && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Range</span>
                        <span className="text-white font-semibold">
                          {car.range_km} km
                        </span>
                      </div>
                    )}
                    {car.battery_kwh && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Battery</span>
                        <span className="text-white font-semibold">
                          {car.battery_kwh} kWh
                        </span>
                      </div>
                    )}
                    {car.acceleration_0_100 && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">0-100 km/h</span>
                        <span className="text-white font-semibold">
                          {car.acceleration_0_100}s
                        </span>
                      </div>
                    )}
                    {car.price_usd && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Price</span>
                        <span className="text-cyan-400 font-bold">
                          ${car.price_usd.toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* View Details Button */}
                  <button
                    onClick={() => onNavigate('car-detail', { carId: car.id })}
                    className="w-full px-4 py-3 rounded-2xl bg-gradient-to-r from-cyan-500/20 to-blue-600/20 border border-cyan-500/50 text-cyan-300 font-semibold hover:from-cyan-500/40 hover:to-blue-600/40 transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    View Details
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredCars.length === 0 && (
          <div className="text-center py-16">
            <ZapOff className="mx-auto text-gray-600 mb-4" size={48} />
            <h3 className="text-2xl font-bold text-gray-300 mb-2">
              No vehicles found
            </h3>
            <p className="text-gray-500">
              {searchQuery || selectedType !== 'all'
                ? 'Try adjusting your filters'
                : 'Start exploring our EV database'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
