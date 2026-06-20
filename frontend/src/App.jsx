import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { Toaster } from "@/components/ui/sonner"
import { loadStripe } from '@stripe/stripe-js'
import { Elements } from '@stripe/react-stripe-js'
import api from '@/config/axios'
// -------- Page import
import { Navbar, Footer } from './components/common/index'

import { Home, ProductPage, SearchPage, Login, Register, ForgotPassword, ResetPassword, Profile, Cart, Shipping, ConfirmOrder, Payment, MyOrders, OrderDetails } from './pages/index'
import Dashboard from './pages/admin/Dashboard'
import AdminUsers from './pages/admin/AdminUsers'
import AdminOrders from './pages/admin/AdminOrders'
import NewProduct from './pages/admin/NewProduct'
import AdminProducts from './pages/admin/AdminProducts'
import ProtectedRoute from './components/ProtectedRoute'
import useUserStore from '../store/useUserStore';


function App() {

  const {isAuthenticated } = useUserStore();

  const checkAuth = useUserStore((s) => s.checkAuth);
  const authChecked = useUserStore((s) => s.authChecked);

  useEffect(() => {
    if (!authChecked) {
      checkAuth();
    }
  }, [authChecked]);
  const [stripePromise, setStripePromise] = useState(null);
  const [stripeConfigChecked, setStripeConfigChecked] = useState(false);

  useEffect(() => {
    async function getStripeKey() {
      try {
        const { data } = await api.get("/payment/config");
        if (data.publishableKey) {
          setStripePromise(loadStripe(data.publishableKey));
        }
      } catch (error) {
        console.error("Failed to fetch Stripe publishable key", error);
      } finally {
        setStripeConfigChecked(true);
      }
    }

    // Only fetch stripe key if user is authenticated
    if (isAuthenticated) {
      getStripeKey();
    } else {
      setStripeConfigChecked(true);
    }
  }, [isAuthenticated]);



  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <>
      <BrowserRouter>
        <Navbar />
        <Toaster
          position="top-right"
          richColors
          closeButton
          expand={false}
          duration={4000}
        />

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path='/product/:id' element={<ProductPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/shipping"
            element={
              <ProtectedRoute>
                <Shipping />
              </ProtectedRoute>
            }
          />
          <Route path="/order/confirm"
            element={
              <ProtectedRoute>
                <ConfirmOrder />
              </ProtectedRoute>
            }
          />
          <Route path="/payment/process"
            element={
              <ProtectedRoute>
                {!stripeConfigChecked ? (
                  <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="flex flex-col items-center gap-3">
                      <svg className="animate-spin h-8 w-8 text-indigo-600" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      <p className="text-sm text-gray-500">Loading payment gateway...</p>
                    </div>
                  </div>
                ) : stripePromise ? (
                  <Elements stripe={stripePromise}>
                    <Payment />
                  </Elements>
                ) : (
                  <Payment />
                )}
              </ProtectedRoute>
            }
          />
          <Route path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route path="/orders/me"
            element={
              <ProtectedRoute>
                <MyOrders />
              </ProtectedRoute>
            }
          />
          <Route path="/order/:id"
            element={
              <ProtectedRoute>
                <OrderDetails />
              </ProtectedRoute>
            }
          />
          <Route path="/admin/dashboard"
            element={
              <ProtectedRoute isAdmin>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route path="/admin/users"
            element={
              <ProtectedRoute isAdmin>
                <AdminUsers />
              </ProtectedRoute>
            }
          />
          <Route path="/admin/orders"
            element={
              <ProtectedRoute isAdmin>
                <AdminOrders />
              </ProtectedRoute>
            }
          />
          <Route path="/admin/product/new"
            element={
              <ProtectedRoute isAdmin>
                <NewProduct />
              </ProtectedRoute>
            }
          />
          <Route path="/admin/product/:id"
            element={
              <ProtectedRoute isAdmin>
                <NewProduct />
              </ProtectedRoute>
            }
          />

          <Route path="/admin/products"
            element={
              <ProtectedRoute isAdmin>
                <AdminProducts />
              </ProtectedRoute>
            }
          />

        </Routes>
        <Footer />
      </BrowserRouter>
    </>
  )
}

export default App
