import { useState, useEffect } from 'react'
import { User, Mail, Calendar, Lock, CheckCircle } from 'lucide-react'
import supabase from '../lib/supabase'

export default function ProfilePage({ onNavigate, user }) {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editMode, setEditMode] = useState(false)
  const [formData, setFormData] = useState({
    full_name: '',
    bio: '',
  })
  const [passwordForm, setPasswordForm] = useState({
    newPassword: '',
    confirmPassword: '',
  })
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [entriesCount, setEntriesCount] = useState(0)
  const [reviewsCount, setReviewsCount] = useState(0)

  // Load profile data
  useEffect(() => {
    if (!user) return

    const loadProfile = async () => {
      try {
        // Get or create profile
        let { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        if (profileError && profileError.code === 'PGRST116') {
          // Profile doesn't exist, create it
          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .insert([
              {
                id: user.id,
                full_name: user.user_metadata?.full_name || '',
                bio: '',
              },
            ])
            .select()
            .single()

          if (createError) throw new Error(createError.message)
          setProfile(newProfile)
          setFormData({
            full_name: newProfile.full_name || '',
            bio: newProfile.bio || '',
          })
        } else if (profileError) {
          throw new Error(profileError.message)
        } else {
          setProfile(profileData)
          setFormData({
            full_name: profileData.full_name || '',
            bio: profileData.bio || '',
          })
        }

        // Count user's entries
        const { count: entriesData, error: entriesError } = await supabase
          .from('ev_entries')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)

        if (!entriesError) setEntriesCount(entriesData || 0)

        // Count user's reviews
        const { count: reviewsData, error: reviewsError } = await supabase
          .from('reviews')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)

        if (!reviewsError) setReviewsCount(reviewsData || 0)
      } catch (err) {
        setError(err.message)
        console.error('Error loading profile:', err)
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [user])

  const handleUpdateProfile = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!formData.full_name.trim()) {
      setError('Name cannot be empty')
      return
    }

    setLoading(true)
    try {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name,
          bio: formData.bio,
        })
        .eq('id', user.id)

      if (updateError) throw new Error(updateError.message)

      setProfile({
        ...profile,
        full_name: formData.full_name,
        bio: formData.bio,
      })
      setSuccess('Profile updated successfully')
      setEditMode(false)
    } catch (err) {
      setError(err.message)
      console.error('Error updating profile:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!passwordForm.newPassword.trim()) {
      setError('New password cannot be empty')
      return
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (passwordForm.newPassword.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setLoading(true)
    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: passwordForm.newPassword,
      })

      if (updateError) throw new Error(updateError.message)

      setSuccess('Password changed successfully')
      setPasswordForm({ newPassword: '', confirmPassword: '' })
      setShowPasswordForm(false)
    } catch (err) {
      setError(err.message)
      console.error('Error changing password:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading && !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-black to-slate-900 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-black to-slate-900">
      {/* Background mesh gradients */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 right-1/3 w-96 h-96 bg-purple-500/20 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-cyan-500/20 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600">
              <User size={28} className="text-white" />
            </div>
            My Profile
          </h1>
          <p className="text-gray-400">Manage your account and contributions</p>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-red-500/20 border border-red-500/50 text-red-300 animate-in slide-in-from-top">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-6 p-4 rounded-2xl bg-green-500/20 border border-green-500/50 text-green-300 flex items-center gap-2 animate-in slide-in-from-top">
            <CheckCircle size={20} />
            {success}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-8 shadow-2xl">
              <div className="text-center mb-6">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center mx-auto mb-4">
                  <User size={48} className="text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white">{profile?.full_name || 'Unnamed User'}</h2>
                <p className="text-gray-400 text-sm mt-1 truncate">{user?.email}</p>
              </div>

              {/* Stats */}
              <div className="space-y-3 border-t border-white/10 pt-6">
                <div className="flex items-center justify-between p-3 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors">
                  <span className="text-gray-400 text-sm">Entries Created</span>
                  <span className="text-white font-bold text-lg">{entriesCount}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors">
                  <span className="text-gray-400 text-sm">Reviews Posted</span>
                  <span className="text-white font-bold text-lg">{reviewsCount}</span>
                </div>
              </div>

              {/* Join Date */}
              <div className="mt-6 pt-6 border-t border-white/10">
                <div className="flex items-center gap-2 text-gray-400 text-sm">
                  <Calendar size={16} />
                  <span>Joined {new Date(profile?.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Edit Profile & Settings */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Edit Card */}
            <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-8 shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-white/10">
                    <User size={20} className="text-cyan-400" />
                  </div>
                  Profile Information
                </h3>
                {!editMode && (
                  <button
                    onClick={() => setEditMode(true)}
                    className="px-4 py-2 rounded-2xl bg-cyan-500/20 border border-cyan-400/50 text-cyan-400 hover:bg-cyan-500/30 transition-colors font-semibold"
                  >
                    Edit
                  </button>
                )}
              </div>

              {editMode ? (
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-white mb-2">Full Name</label>
                    <input
                      type="text"
                      value={formData.full_name}
                      onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                      className="w-full px-6 py-3 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-white mb-2">Bio</label>
                    <textarea
                      value={formData.bio}
                      onChange={(e) => setFormData({...formData, bio: e.target.value})}
                      placeholder="Tell the community about yourself..."
                      className="w-full px-6 py-3 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 transition-all resize-none h-24"
                    />
                  </div>
                  <div className="flex gap-3 pt-4">
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 px-6 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold transition-all duration-300 hover:scale-105 active:scale-95 disabled:scale-100"
                    >
                      Save Changes
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditMode(false)
                        setFormData({
                          full_name: profile?.full_name || '',
                          bio: profile?.bio || '',
                        })
                      }}
                      className="flex-1 px-6 py-3 rounded-2xl bg-white/10 border border-white/20 text-white font-semibold hover:bg-white/20 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Full Name</p>
                    <p className="text-white font-semibold mt-1">{profile?.full_name || 'Not set'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Bio</p>
                    <p className="text-gray-300 mt-1">{profile?.bio || 'No bio added yet'}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Email & Security Card */}
            <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-8 shadow-2xl">
              <h3 className="text-xl font-bold text-white flex items-center gap-2 mb-6">
                <div className="p-2 rounded-lg bg-white/10">
                  <Lock size={20} className="text-amber-400" />
                </div>
                Security
              </h3>

              {/* Email */}
              <div className="mb-6 p-4 rounded-2xl bg-white/5 border border-white/10">
                <div className="flex items-center gap-2 mb-2">
                  <Mail size={18} className="text-cyan-400" />
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Email Address</p>
                </div>
                <p className="text-white font-semibold">{user?.email}</p>
              </div>

              {/* Password Change */}
              {!showPasswordForm ? (
                <button
                  onClick={() => setShowPasswordForm(true)}
                  className="w-full px-6 py-3 rounded-2xl bg-amber-500/20 border border-amber-400/50 text-amber-400 hover:bg-amber-500/30 transition-colors font-semibold"
                >
                  Change Password
                </button>
              ) : (
                <form onSubmit={handleChangePassword} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-white mb-2">New Password</label>
                    <input
                      type="password"
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                      placeholder="Enter new password"
                      className="w-full px-6 py-3 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-white mb-2">Confirm Password</label>
                    <input
                      type="password"
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                      placeholder="Confirm new password"
                      className="w-full px-6 py-3 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 transition-all"
                    />
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-semibold transition-all duration-300 hover:scale-105 active:scale-95 disabled:scale-100"
                    >
                      Update Password
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowPasswordForm(false)
                        setPasswordForm({ newPassword: '', confirmPassword: '' })
                      }}
                      className="flex-1 px-6 py-3 rounded-2xl bg-white/10 border border-white/20 text-white font-semibold hover:bg-white/20 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
