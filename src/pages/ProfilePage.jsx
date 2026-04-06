import { useState, useEffect } from 'react'
import { ChevronLeft, Mail, Calendar, Lock, AlertCircle, CheckCircle } from 'lucide-react'
import supabase from '../lib/supabase'

export default function ProfilePage({ onNavigate, user }) {
  const [profile, setProfile] = useState({
    email: user?.email || '',
    full_name: '',
    created_at: user?.created_at || '',
  })

  const [passwordData, setPasswordData] = useState({
    new_password: '',
    confirm_password: '',
  })

  const [loading, setLoading] = useState(false)
  const [loadingProfile, setLoadingProfile] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [tab, setTab] = useState('profile')

  // Fetch user profile from profiles table
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?.id) return

      try {
        const { data, error: fetchError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        if (fetchError && fetchError.code !== 'PGRST116') {
          // PGRST116 = row not found, which is okay
          throw new Error(fetchError.message)
        }

        if (data) {
          setProfile((prev) => ({
            ...prev,
            full_name: data.full_name || '',
            created_at: data.created_at || user.created_at || '',
          }))
        }
      } catch (err) {
        console.error('Error fetching profile:', err)
      } finally {
        setLoadingProfile(false)
      }
    }

    fetchProfile()
  }, [user?.id, user?.created_at, user?.email])

  const handleProfileChange = (e) => {
    const { name, value } = e.target
    setProfile((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handlePasswordChange = (e) => {
    const { name, value } = e.target
    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleUpdateProfile = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!profile.full_name.trim()) {
      setError('Full name is required')
      return
    }

    setLoading(true)
    try {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          full_name: profile.full_name.trim(),
        })
        .eq('id', user.id)

      if (updateError) throw new Error(updateError.message)

      setSuccess('Profile updated successfully!')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err.message)
      console.error('Error updating profile:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdatePassword = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!passwordData.new_password || !passwordData.confirm_password) {
      setError('Both password fields are required')
      return
    }

    if (passwordData.new_password !== passwordData.confirm_password) {
      setError('Passwords do not match')
      return
    }

    if (passwordData.new_password.length < 6) {
      setError('Password must be at least 6 characters long')
      return
    }

    setLoading(true)
    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: passwordData.new_password,
      })

      if (updateError) throw new Error(updateError.message)

      setSuccess('Password updated successfully!')
      setPasswordData({
        new_password: '',
        confirm_password: '',
      })
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err.message)
      console.error('Error updating password:', err)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'Not available'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  if (loadingProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-black to-slate-900">
        <div className="fixed inset-0 -z-10 overflow-hidden">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        </div>
        <div className="relative z-10 max-w-2xl mx-auto px-4 py-12">
          <div className="space-y-6">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="h-20 rounded-3xl bg-white/10 border border-white/20 animate-pulse"
              ></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-black to-slate-900">
      {/* Background mesh gradients */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-pink-500/20 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>

      <div className="relative z-10 max-w-2xl mx-auto px-4 py-12">
        {/* Back Button */}
        <button
          onClick={() => onNavigate('browse')}
          className="flex items-center gap-2 text-purple-400 hover:text-purple-300 mb-8 transition-colors font-semibold"
        >
          <ChevronLeft size={20} />
          Back to Browse
        </button>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white tracking-tight">
            Profile Settings
          </h1>
          <p className="text-gray-400 mt-2">
            Manage your account information and security
          </p>
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

        {/* Success Message */}
        {success && (
          <div className="mb-8 p-6 rounded-3xl bg-green-500/20 border border-green-500/50 flex gap-4">
            <CheckCircle className="text-green-400 flex-shrink-0" size={20} />
            <div>
              <p className="text-green-100 font-semibold">Success</p>
              <p className="text-green-100 text-sm mt-1">{success}</p>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-white/10">
          <button
            onClick={() => {
              setTab('profile')
              setError('')
              setSuccess('')
            }}
            className={`pb-4 font-semibold transition-colors ${
              tab === 'profile'
                ? 'text-purple-400 border-b-2 border-purple-400'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            Account Info
          </button>
          <button
            onClick={() => {
              setTab('password')
              setError('')
              setSuccess('')
            }}
            className={`pb-4 font-semibold transition-colors ${
              tab === 'password'
                ? 'text-purple-400 border-b-2 border-purple-400'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            Change Password
          </button>
        </div>

        {/* Account Info Tab */}
        {tab === 'profile' && (
          <form onSubmit={handleUpdateProfile} className="space-y-6">
            {/* Email (Read-only) */}
            <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <Mail className="text-purple-400" size={24} />
                <h2 className="text-xl font-bold text-white">Email Address</h2>
              </div>
              <input
                type="email"
                value={profile.email}
                disabled
                className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/20 text-gray-400 cursor-not-allowed"
              />
              <p className="text-gray-500 text-sm mt-3">
                Your email address cannot be changed. Contact support if you need to update it.
              </p>
            </div>

            {/* Full Name */}
            <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-8">
              <label className="block text-white font-semibold mb-4">
                Full Name
              </label>
              <input
                type="text"
                name="full_name"
                value={profile.full_name}
                onChange={handleProfileChange}
                placeholder="Enter your full name"
                className="w-full px-4 py-3 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-gray-500 focus:ring-2 focus:ring-purple-500 outline-none transition-all"
              />
            </div>

            {/* Account Created */}
            <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-8">
              <div className="flex items-center gap-3 mb-4">
                <Calendar className="text-purple-400" size={24} />
                <h3 className="text-white font-semibold">Account Created</h3>
              </div>
              <p className="text-gray-300 text-lg">
                {formatDate(profile.created_at)}
              </p>
            </div>

            {/* Save Button */}
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
                className="flex-1 px-6 py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        )}

        {/* Change Password Tab */}
        {tab === 'password' && (
          <form onSubmit={handleUpdatePassword} className="space-y-6">
            {/* New Password */}
            <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <Lock className="text-purple-400" size={24} />
                <h2 className="text-xl font-bold text-white">New Password</h2>
              </div>
              <input
                type="password"
                name="new_password"
                value={passwordData.new_password}
                onChange={handlePasswordChange}
                placeholder="Enter new password"
                className="w-full px-4 py-3 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-gray-500 focus:ring-2 focus:ring-purple-500 outline-none transition-all"
              />
              <p className="text-gray-500 text-sm mt-3">
                Password must be at least 6 characters long
              </p>
            </div>

            {/* Confirm Password */}
            <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-8">
              <label className="block text-white font-semibold mb-4">
                Confirm Password
              </label>
              <input
                type="password"
                name="confirm_password"
                value={passwordData.confirm_password}
                onChange={handlePasswordChange}
                placeholder="Confirm your password"
                className="w-full px-4 py-3 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-gray-500 focus:ring-2 focus:ring-purple-500 outline-none transition-all"
              />
            </div>

            {/* Update Button */}
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => {
                  setTab('profile')
                  setPasswordData({
                    new_password: '',
                    confirm_password: '',
                  })
                }}
                className="flex-1 px-6 py-4 rounded-2xl backdrop-blur-xl bg-white/10 border border-white/20 text-white font-semibold hover:bg-white/20 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
