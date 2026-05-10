import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Input } from '@/components/ui';
import { User, Mail, Save, Lock, LogOut, Camera, Loader2, ShieldCheck, KeyRound } from 'lucide-react';
import { toast } from 'sonner';
import useUserStore from '../../store/useUserStore';
import MetaData from '@/components/common/Metadata';

export default function Profile() {
  const navigate = useNavigate();
  const {
    user,
    updateProfile,
    updatePassword,
    logoutUser,
    isUpdating,
    clearMessage,
    message,
    loading,
    error
  } = useUserStore();

  const [activeTab, setActiveTab] = useState('profile');
  const [profileForm, setProfileForm] = useState({
    name: '',
    email: ''
  });
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const fileInputRef = useRef(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarToUpload, setAvatarToUpload] = useState(null);


  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || '',
        email: user.email || ''
      });

      setAvatarPreview(user.avatar?.url || null);
    }
  }, [user]);

  useEffect(() => {
    if (message) {
      toast.success(message);
      clearMessage();
    }
  }, [message, clearMessage]);


  // Handelers ------------
  const handleProfileChange = (e) => {
    setProfileForm({
      ...profileForm,
      [e.target.name]: e.target.value
    });
  };

  const handlePasswordChange = (e) => {
    setPasswordForm({
      ...passwordForm,
      [e.target.name]: e.target.value
    });
  };


  // Avatar Handelers ------------

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Basic validation for file size (e.g., max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Image size should be less than 2MB');
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        setAvatarPreview(reader.result);
        setAvatarToUpload(file);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!profileForm.name.trim() || !profileForm.email.trim()) {
      toast.error('Please fill in all fields');
      return;
    }
    await updateProfile(profileForm);
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();

    if (!passwordForm.oldPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      toast.error('Please fill in all fields');
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    await updatePassword({
      oldPassword: passwordForm.oldPassword,
      newPassword: passwordForm.newPassword
    });

    setPasswordForm({
      oldPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
  };

  const handleLogout = async () => {
    await logoutUser();
    navigate('/login');
    toast.success('Logged out successfully');
  };

  // if (loading) {
  //   return <h1 className="text-2xl md:text-3xl font-bold mb-6">Loading...</h1>;
  // }

  // if (!user) {
  //   navigate('/login');
  //   return null;
  // }

  return (
    <>
      <MetaData title="My Profile | ShopHub" />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">

          {/* Header & Avatar Section */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 mb-6">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              {/* Avatar */}
              <div className="relative group">
                <div className="w-24 h-24 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden border-4 border-white dark:border-gray-800 shadow-lg">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <User className="w-10 h-10" />
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current.click()}
                  className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity text-white"
                >
                  <Camera className="w-6 h-6" />
                </button>
                <input
                  type="file"
                  name="avatar"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  ref={fileInputRef}
                  className="hidden"
                />
              </div>

              {/* User Info Summary */}
              <div className="text-center sm:text-left flex-1">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{user.name}</h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">{user.email}</p>
                <div className="mt-3 inline-flex items-center gap-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-medium px-3 py-1 rounded-full">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  {user.role === 'admin' ? 'Administrator' : 'Member'}
                </div>
              </div>
            </div>
          </div>

          {/* Tabs Navigation */}
          <div className="flex gap-1 mb-6 bg-white dark:bg-gray-800 p-1 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium rounded-md transition-all ${activeTab === 'profile'
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
            >
              <User className="w-4 h-4" />
              Profile
            </button>
            <button
              onClick={() => setActiveTab('password')}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium rounded-md transition-all ${activeTab === 'password'
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
            >
              <KeyRound className="w-4 h-4" />
              Security
            </button>
          </div>

          {/* Profile Tab Content */}
          {activeTab === 'profile' && (
            <form onSubmit={handleUpdateProfile} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Personal Information</h2>
              <div className="space-y-5">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="name"
                      name="name"
                      value={profileForm.name}
                      onChange={handleProfileChange}
                      className="pl-10"
                      placeholder="John Doe"
                      disabled={isUpdating}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={profileForm.email}
                      onChange={handleProfileChange}
                      className="pl-10"
                      placeholder="john@example.com"
                      disabled={isUpdating}
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <Button type="submit" className="w-full sm:w-auto gap-2" disabled={isUpdating}>
                    {isUpdating ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    {isUpdating ? 'Saving Changes...' : 'Save Changes'}
                  </Button>
                </div>
              </div>
            </form>
          )}

          {/* Password Tab Content */}
          {activeTab === 'password' && (
            <form onSubmit={handleUpdatePassword} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Update Password</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Ensure your account is using a strong password.</p>
              <div className="space-y-5">
                <div>
                  <label htmlFor="oldPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Current Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="oldPassword"
                      name="oldPassword"
                      type="password"
                      value={passwordForm.oldPassword}
                      onChange={handlePasswordChange}
                      className="pl-10"
                      placeholder="••••••••"
                      disabled={isUpdating}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    New Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="newPassword"
                      name="newPassword"
                      type="password"
                      value={passwordForm.newPassword}
                      onChange={handlePasswordChange}
                      className="pl-10"
                      placeholder="••••••••"
                      disabled={isUpdating}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      value={passwordForm.confirmPassword}
                      onChange={handlePasswordChange}
                      className="pl-10"
                      placeholder="••••••••"
                      disabled={isUpdating}
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <Button type="submit" variant="outline" className="w-full sm:w-auto gap-2" disabled={isUpdating}>
                    {isUpdating ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <KeyRound className="h-4 w-4" />
                    )}
                    {isUpdating ? 'Updating...' : 'Update Password'}
                  </Button>
                </div>
              </div>
            </form>
          )}

          {/* Danger Zone */}
          <div className="mt-8 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-red-100 dark:border-red-900/50 p-6">
            <h2 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-2">Danger Zone</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Once you log out, you will need to enter your credentials again to access your account.
            </p>
            <Button onClick={handleLogout} variant="destructive" className="gap-2">
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>

        </div>
      </div>
    </>
  );
}