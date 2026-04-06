import { useState } from 'react'
import { ChevronLeft, Plus, CheckCircle, AlertCircle, Zap } from 'lucide-react'
import supabase from '../lib/supabase'

export default function CreateEntryPage({ onNavigate, user }) {
  const [formData, setFormData] = useState({
    manufacturer: '',
    name: '',
    model_year: new Date().getFullYear(),
    type: 'Sedan',
    price_usd: '',
    range_km: '',
    battery_kwh: '',
    acceleration_0_100: '',
    top_speed: '',
    charging_time_fast: '',
    seating: '',
    image_url: '',
    description: '',
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const carTypes = ['Sedan', 'SUV', 'Truck', 'Hatchback', 'Van', 'Sports', 'Other']

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'model_year' || name === 'price_usd' || name === 'seating' 
        ? value === '' ? '' : parseInt(value)
        : name === 'range_km' || name === 'battery_kwh' || name === 'top_speed'
        ? value === '' ? '' : parseFloat(value)
        : value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess(false)

    // Validate required fields
    if (!formData.manufacturer.trim() || !formData.name.trim()) {
      setError('Manufacturer and model name are required')
      return
    }

    setLoading(true)
    try {
      const { error: insertError } = await supabase
        .from('cars')
        .insert([
          {
            ...formData,
            manufacturer: formData.manufacturer.trim(),
            name: formData.name.trim(),
            description: formData.description.trim() || null,
            price_usd: formData.price_usd || null,
            range_km: formData.range_km || null,
            battery_kwh: formData.battery_kwh || null,
            acceleration_0_100: formData.acceleration_0_100 || null,
            top_speed: formData.top_speed || null,
            charging_time_fast: formData.charging_time_fast || null,
            seating: formData.seating || null,
            image_url: formData.image_url || null,
            created_by: user?.id,
          },
        ])

      if (insertError) throw new Error(insertError.message)

      setSuccess(true)
      setFormData({
        manufacturer: '',
        name: '',
        model_year: new Date().getFullYear(),
        type: 'Sedan',
        price_usd: '',
        range_km: '',
        battery_kwh: '',
        acceleration_0_100: '',
        top_speed: '',
        charging_time_fast: '',
        seating: '',
        image_url: '',
        description: '',
      })

      setTimeout(() => {
        onNavigate('browse')
      }, 2000)
    } catch (err) {
      setError(err.message)
      console.error('Error creating entry:', err)
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-black to-slate-900">
        <div className="fixed inset-0 -z-10 overflow-hidden">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-green-500/20 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        </div>
        <div className="relative z-10 max-w-2xl mx-auto px-4 py-24 flex items-center justify-center min-h-screen">
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-12 text-center">
            <CheckCircle className="mx-auto text-green-400 mb-4" size={64} />
            <h1 className="text-3xl font-bold text-white mb-2">Success!</h1>
            <p className="text-gray-300 mb-6">
              Your EV has been added to the database. Redirecting...
            </p>
            <button
              onClick={() => onNavigate('browse')}
              className="px-6 py-3 rounded-2xl bg-green-600 text-white font-semibold hover:bg-green-700 transition-colors"
            >
              Go to Browse
            </button>
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
      </div>

      <div className="relative z-10 max-w-2xl mx-auto px-4 py-12">
        {/* Back Button */}
        <button
          onClick={() => onNavigate('browse')}
          className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 mb-8 transition-colors font-semibold"
        >
          <ChevronLeft size={20} />
          Back to Browse
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Plus className="text-cyan-400" size={32} />
          <div>
            <h1 className="text-4xl font-bold text-white tracking-tight">
              Add a New EV
            </h1>
            <p className="text-gray-400 mt-1">
              Contribute to our community database of electric vehicles
            </p>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-8 p-6 rounded-3xl bg-red-500/20 border border-red-500/50 flex gap-4">
            <AlertCircle className="text-red-400 flex-shrink-0" size={20} />
            <div>
              <p className="text-red-100 font-semibold">Error</p>
              <p className="text-red-100 text-sm mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            {/* Basic Information Section */}
            <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-8">
              <h2 className="text-xl font-bold text-white mb-6">Basic Information</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Manufacturer */}
                <div>
                  <label className="block text-white font-semibold mb-3">
                    Manufacturer *
                  </label>
                  <input
                    type="text"
                    name="manufacturer"
                    value={formData.manufacturer}
                    onChange={handleChange}
                    placeholder="e.g., Tesla"
                    required
                    className="w-full px-4 py-3 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-gray-500 focus:ring-2 focus:ring-cyan-500 outline-none transition-all"
                  />
                </div>

                {/* Model Name */}
                <div>
                  <label className="block text-white font-semibold mb-3">
                    Model Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g., Model 3"
                    required
                    className="w-full px-4 py-3 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-gray-500 focus:ring-2 focus:ring-cyan-500 outline-none transition-all"
                  />
                </div>

                {/* Year */}
                <div>
                  <label className="block text-white font-semibold mb-3">
                    Model Year
                  </label>
                  <input
                    type="number"
                    name="model_year"
                    value={formData.model_year}
                    onChange={handleChange}
                    min="2010"
                    max={new Date().getFullYear() + 1}
                    className="w-full px-4 py-3 rounded-2xl bg-white/10 border border-white/20 text-white focus:ring-2 focus:ring-cyan-500 outline-none transition-all"
                  />
                </div>

                {/* Type */}
                <div>
                  <label className="block text-white font-semibold mb-3">
                    Vehicle Type
                  </label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-2xl bg-white/10 border border-white/20 text-white focus:ring-2 focus:ring-cyan-500 outline-none transition-all"
                  >
                    {carTypes.map((type) => (
                      <option key={type} value={type} className="bg-slate-900">
                        {type}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Performance & Specifications Section */}
            <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-8">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Zap className="text-yellow-400" size={24} />
                Performance & Specifications
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Price */}
                <div>
                  <label className="block text-white font-semibold mb-3">
                    Starting Price (USD)
                  </label>
                  <input
                    type="number"
                    name="price_usd"
                    value={formData.price_usd}
                    onChange={handleChange}
                    placeholder="e.g., 45000"
                    className="w-full px-4 py-3 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-gray-500 focus:ring-2 focus:ring-cyan-500 outline-none transition-all"
                  />
                </div>

                {/* Range */}
                <div>
                  <label className="block text-white font-semibold mb-3">
                    Range (km)
                  </label>
                  <input
                    type="number"
                    name="range_km"
                    value={formData.range_km}
                    onChange={handleChange}
                    placeholder="e.g., 560"
                    step="0.1"
                    className="w-full px-4 py-3 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-gray-500 focus:ring-2 focus:ring-cyan-500 outline-none transition-all"
                  />
                </div>

                {/* Battery */}
                <div>
                  <label className="block text-white font-semibold mb-3">
                    Battery Capacity (kWh)
                  </label>
                  <input
                    type="number"
                    name="battery_kwh"
                    value={formData.battery_kwh}
                    onChange={handleChange}
                    placeholder="e.g., 75"
                    step="0.1"
                    className="w-full px-4 py-3 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-gray-500 focus:ring-2 focus:ring-cyan-500 outline-none transition-all"
                  />
                </div>

                {/* 0-100 km/h */}
                <div>
                  <label className="block text-white font-semibold mb-3">
                    0-100 km/h (seconds)
                  </label>
                  <input
                    type="number"
                    name="acceleration_0_100"
                    value={formData.acceleration_0_100}
                    onChange={handleChange}
                    placeholder="e.g., 5.8"
                    step="0.1"
                    className="w-full px-4 py-3 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-gray-500 focus:ring-2 focus:ring-cyan-500 outline-none transition-all"
                  />
                </div>

                {/* Top Speed */}
                <div>
                  <label className="block text-white font-semibold mb-3">
                    Top Speed (km/h)
                  </label>
                  <input
                    type="number"
                    name="top_speed"
                    value={formData.top_speed}
                    onChange={handleChange}
                    placeholder="e.g., 225"
                    className="w-full px-4 py-3 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-gray-500 focus:ring-2 focus:ring-cyan-500 outline-none transition-all"
                  />
                </div>

                {/* Charging Time */}
                <div>
                  <label className="block text-white font-semibold mb-3">
                    Fast Charging Time (10-80%)
                  </label>
                  <input
                    type="text"
                    name="charging_time_fast"
                    value={formData.charging_time_fast}
                    onChange={handleChange}
                    placeholder="e.g., 25 min"
                    className="w-full px-4 py-3 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-gray-500 focus:ring-2 focus:ring-cyan-500 outline-none transition-all"
                  />
                </div>

                {/* Seating */}
                <div>
                  <label className="block text-white font-semibold mb-3">
                    Seating Capacity
                  </label>
                  <input
                    type="number"
                    name="seating"
                    value={formData.seating}
                    onChange={handleChange}
                    placeholder="e.g., 5"
                    min="1"
                    max="9"
                    className="w-full px-4 py-3 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-gray-500 focus:ring-2 focus:ring-cyan-500 outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Images & Description Section */}
            <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-8">
              <h2 className="text-xl font-bold text-white mb-6">Images & Description</h2>

              <div className="space-y-6">
                {/* Image URL */}
                <div>
                  <label className="block text-white font-semibold mb-3">
                    Image URL
                  </label>
                  <input
                    type="url"
                    name="image_url"
                    value={formData.image_url}
                    onChange={handleChange}
                    placeholder="https://example.com/car-image.jpg"
                    className="w-full px-4 py-3 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-gray-500 focus:ring-2 focus:ring-cyan-500 outline-none transition-all"
                  />
                  <p className="text-gray-500 text-sm mt-2">
                    Provide a high-quality image URL of the vehicle
                  </p>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-white font-semibold mb-3">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Write a detailed description about this EV. Include key features, pros, cons, and any other relevant information..."
                    rows={6}
                    className="w-full px-4 py-3 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-gray-500 focus:ring-2 focus:ring-cyan-500 outline-none transition-all resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => onNavigate('browse')}
                className="flex-1 px-6 py-4 rounded-2xl backdrop-blur-xl bg-white/10 border border-white/20 text-white font-semibold hover:bg-white/20 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Adding...' : 'Add to Database'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
