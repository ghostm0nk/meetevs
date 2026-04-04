import React, { useState, useEffect } from 'react'
import { Plus, Star, Calendar, Battery } from 'lucide-react'

const CarList = ({ onCarSelect, supabase }) => {
  const [cars, setCars] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Mock data - in real app, this would fetch from Supabase
    const mockCars = [
      {
        id: 1,
        make: 'Tesla',
        model: 'Model 3',
        year: 2023,
        range_km: 450,
        image_url: 'https://via.placeholder.com/300x200',
        rating: 4.5,
        reviews_count: 12
      },
      {
        id: 2,
        make: 'Ford',
        model: 'Mustang Mach-E',
        year: 2023,
        range_km: 380,
        image_url: 'https://via.placeholder.com/300x200',
        rating: 4.3,
        reviews_count: 8
      },
      {
        id: 3,
        make: 'Volkswagen',
        model: 'ID.4',
        year: 2023,
        range_km: 420,
        image_url: 'https://via.placeholder.com/300x200',
        rating: 4.2,
        reviews_count: 15
      }
    ]
    
    setTimeout(() => {
      setCars(mockCars)
      setLoading(false)
    }, 500)
  }, [])

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
        <p className="mt-4 text-gray-400">Loading EVs...</p>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold">Electric Vehicles</h2>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors">
          <Plus className="w-5 h-5" />
          <span>Add EV</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cars.map((car) => (
          <div
            key={car.id}
            onClick={() => onCarSelect(car)}
            className="bg-gray-800 rounded-lg overflow-hidden hover:ring-2 hover:ring-blue-400 transition-all cursor-pointer"
          >
            <img
              src={car.image_url}
              alt={`${car.make} ${car.model}`}
              className="w-full h-48 object-cover"
            />
            <div className="p-4">
              <h3 className="text-xl font-semibold mb-2">
                {car.make} {car.model}
              </h3>
              <div className="flex items-center justify-between text-sm text-gray-400 mb-3">
                <span className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>{car.year}</span>
                </span>
                <span className="flex items-center space-x-1">
                  <Battery className="w-4 h-4" />
                  <span>{car.range_km} km</span>
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="text-sm">{car.rating}</span>
                  <span className="text-xs text-gray-500">({car.reviews_count})</span>
                </div>
                <span className="text-blue-400 text-sm font-medium">View Details →</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default CarList
