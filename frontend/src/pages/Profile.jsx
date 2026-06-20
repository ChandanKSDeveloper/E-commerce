import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button, Input } from '@/components/ui';
import { User, Mail, Save, Lock, LogOut, Camera, Loader2, ShieldCheck, KeyRound, ShoppingBag, Calendar, Truck, CreditCard, ChevronDown, ChevronUp, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import useUserStore from '../../store/useUserStore';
import useOrderStore from '../../store/useOrderStore';
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

  const { orders, getMyOrders, loading: ordersLoading } = useOrderStore();

  const [activeTab, setActiveTab] = useState('profile');
  const [expandedOrder, setExpandedOrder] = useState(null);
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

  useEffect(() => {
    if (activeTab === 'orders') {
      getMyOrders();
    }
  }, [activeTab, getMyOrders]);


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
            <button
              onClick={() => setActiveTab('orders')}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium rounded-md transition-all ${activeTab === 'orders'
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
            >
              <ShoppingBag className="w-4 h-4" />
              My Orders
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

          {/* Orders Tab Content */}
          {activeTab === 'orders' && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-primary" /> Order History
              </h2>

              {ordersLoading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
                  <p className="text-sm text-gray-500">Loading your orders...</p>
                </div>
              ) : !orders || orders.length === 0 ? (
                <div className="text-center py-12">
                  <div className="inline-flex p-4 rounded-full bg-primary/5 mb-4">
                    <ShoppingBag className="h-10 w-10 text-primary" />
                  </div>
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">No Orders Found</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                    You haven't placed any orders yet. Let's find some amazing products!
                  </p>
                  <Link to="/">
                    <Button size="sm">Start Shopping</Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-6">
                  {orders.map((ord) => (
                    <div
                      key={ord._id}
                      className="border border-gray-100 dark:border-gray-750 rounded-xl overflow-hidden shadow-sm"
                    >
                      {/* Order Header / Toggle Clickable */}
                      <div
                        onClick={() => setExpandedOrder(expandedOrder === ord._id ? null : ord._id)}
                        className="bg-gray-50 dark:bg-gray-900/50 p-4 border-b border-gray-100 dark:border-gray-750 flex flex-wrap items-center justify-between gap-3 text-sm cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-900/80 transition-colors"
                      >
                        <div className="flex flex-wrap gap-x-6 gap-y-2">
                          <div>
                            <span className="block text-xs text-gray-400 font-medium uppercase">Order ID</span>
                            <span className="font-mono text-gray-700 dark:text-gray-300 font-semibold text-xs">#{ord._id}</span>
                          </div>
                          <div>
                            <span className="block text-xs text-gray-400 font-medium uppercase">Date Placed</span>
                            <span className="font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                              <Calendar className="h-3.5 w-3.5 text-gray-400" />
                              {new Date(ord.createdAt || ord.paidAt).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                              })}
                            </span>
                          </div>
                          <div>
                            <span className="block text-xs text-gray-400 font-medium uppercase">Total Price</span>
                            <span className="font-bold text-primary">₹{ord.totalPrice?.toLocaleString('en-IN')}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                            ord.orderStatus === 'Delivered'
                              ? 'bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400'
                              : ord.orderStatus === 'Shipped'
                                ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400'
                                : 'bg-yellow-50 text-yellow-700 dark:bg-yellow-950/30 dark:text-yellow-400'
                          }`}>
                            {ord.orderStatus}
                          </span>
                          {expandedOrder === ord._id ? (
                            <ChevronUp className="h-4 w-4 text-gray-500" />
                          ) : (
                            <ChevronDown className="h-4 w-4 text-gray-500" />
                          )}
                        </div>
                      </div>

                      {/* Order Items */}
                      <div className="divide-y divide-gray-100 dark:divide-gray-750 px-4 py-1">
                        {ord.orderItems?.map((item) => (
                          <div key={item.product} className="flex items-center justify-between py-3 gap-4">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                                <img
                                  src={item.image}
                                  alt={item.name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div>
                                <Link
                                  to={`/product/${item.product}`}
                                  className="text-sm font-semibold text-gray-950 dark:text-white hover:text-primary transition-colors line-clamp-1"
                                >
                                  {item.name}
                                </Link>
                                <p className="text-xs text-gray-400 mt-0.5">
                                  Quantity: {item.quantity} × ₹{item.price?.toLocaleString('en-IN')}
                                </p>
                              </div>
                            </div>
                            <div className="text-right font-semibold text-sm text-gray-900 dark:text-white">
                              ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Expanded Details */}
                      {expandedOrder === ord._id && (
                        <div className="bg-gray-50/50 dark:bg-gray-900/30 p-5 border-t border-gray-105 dark:border-gray-750 space-y-6 animate-in slide-in-from-top duration-200">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Shipping Details */}
                            <div className="space-y-2">
                              <h4 className="text-xs font-bold text-gray-450 dark:text-gray-400 uppercase tracking-wider flex items-center gap-2">
                                <Truck className="h-4 w-4 text-primary" /> Shipping Address
                              </h4>
                              <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-100 dark:border-gray-750 text-sm space-y-1 shadow-sm">
                                <p className="font-semibold text-gray-900 dark:text-white">{user?.name}</p>
                                <p className="text-gray-600 dark:text-gray-400">{ord.shippingInfo?.address}</p>
                                <p className="text-gray-600 dark:text-gray-400">
                                  {ord.shippingInfo?.city}, {ord.shippingInfo?.state} - {ord.shippingInfo?.pinCode}
                                </p>
                                <p className="text-gray-600 dark:text-gray-400">{ord.shippingInfo?.country}</p>
                                <p className="text-xs text-gray-400 mt-2 font-medium pt-1 border-t">Phone: {ord.shippingInfo?.phoneNo}</p>
                              </div>
                            </div>

                            {/* Payment Info & Estimated Arrival */}
                            <div className="space-y-4">
                              {/* Payment */}
                              <div className="space-y-2">
                                <h4 className="text-xs font-bold text-gray-450 dark:text-gray-400 uppercase tracking-wider flex items-center gap-2">
                                  <CreditCard className="h-4 w-4 text-primary" /> Payment Method
                                </h4>
                                <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-100 dark:border-gray-750 text-sm shadow-sm">
                                  <p className="font-medium text-gray-800 dark:text-gray-300">Online Payment</p>
                                  <p className="text-xs text-gray-400 font-mono mt-1">ID: {ord.paymentInfo?.id}</p>
                                  <span className="inline-flex items-center gap-1.5 text-xs text-green-600 dark:text-green-400 font-semibold mt-1.5">
                                    <CheckCircle2 className="h-3.5 w-3.5" /> Paid Succeeded
                                  </span>
                                </div>
                              </div>

                              {/* Arrival Date */}
                              <div className="bg-primary/5 p-4 rounded-lg border border-primary/10">
                                <p className="text-xs text-primary font-bold uppercase tracking-wider">Arrival Status</p>
                                <p className="text-sm font-semibold text-gray-900 dark:text-white mt-1">
                                  {ord.orderStatus === 'Delivered' ? (
                                    <span className="text-green-600 dark:text-green-400">
                                      Delivered on {new Date(ord.deliveredAt || ord.updatedAt).toLocaleDateString('en-IN', {
                                        day: 'numeric',
                                        month: 'long',
                                        year: 'numeric'
                                      })}
                                    </span>
                                  ) : (
                                    <span>
                                      Estimated Delivery: <strong className="text-primary">{new Date(new Date(ord.createdAt || ord.paidAt).getTime() + 4 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', {
                                        day: 'numeric',
                                        month: 'long',
                                        year: 'numeric'
                                      })}</strong>
                                    </span>
                                  )}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Tracker Timeline */}
                          <div className="pt-4 border-t border-gray-100 dark:border-gray-750">
                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Order Status Tracker</h4>
                            <div className="flex items-center justify-between w-full max-w-lg mx-auto">
                              {/* Step 1: Placed */}
                              <div className="flex flex-col items-center">
                                <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center text-xs font-semibold shadow-md">
                                  ✓
                                </div>
                                <span className="mt-1.5 text-xs font-semibold text-gray-700 dark:text-gray-300">Placed</span>
                              </div>

                              <div className="flex-1 h-0.5 mx-2 bg-green-500" />

                              {/* Step 2: Processing */}
                              <div className="flex flex-col items-center">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold shadow-md ${
                                  ord.orderStatus !== 'Processing' || ord.orderStatus === 'Shipped' || ord.orderStatus === 'Delivered'
                                    ? 'bg-green-500 text-white'
                                    : 'bg-primary text-white ring-4 ring-primary/20 animate-pulse'
                                }`}>
                                  {ord.orderStatus !== 'Processing' ? '✓' : '2'}
                                </div>
                                <span className="mt-1.5 text-xs font-semibold text-gray-700 dark:text-gray-300">Processing</span>
                              </div>

                              <div className={`flex-1 h-0.5 mx-2 ${
                                ord.orderStatus === 'Shipped' || ord.orderStatus === 'Delivered' ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-750'
                              }`} />

                              {/* Step 3: Shipped */}
                              <div className="flex flex-col items-center">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold shadow-md ${
                                  ord.orderStatus === 'Shipped'
                                    ? 'bg-primary text-white ring-4 ring-primary/20 animate-pulse'
                                    : ord.orderStatus === 'Delivered'
                                      ? 'bg-green-50 text-white'
                                      : 'bg-gray-200 dark:bg-gray-750 text-gray-400'
                                }`}>
                                  {ord.orderStatus === 'Delivered' ? '✓' : '3'}
                                </div>
                                <span className="mt-1.5 text-xs font-semibold text-gray-700 dark:text-gray-300">Shipped</span>
                              </div>

                              <div className={`flex-1 h-0.5 mx-2 ${
                                ord.orderStatus === 'Delivered' ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-750'
                              }`} />

                              {/* Step 4: Delivered */}
                              <div className="flex flex-col items-center">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold shadow-md ${
                                  ord.orderStatus === 'Delivered'
                                    ? 'bg-green-500 text-white'
                                    : 'bg-gray-200 dark:bg-gray-750 text-gray-400'
                                }`}>
                                  4
                                </div>
                                <span className="mt-1.5 text-xs font-semibold text-gray-700 dark:text-gray-300">Delivered</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
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