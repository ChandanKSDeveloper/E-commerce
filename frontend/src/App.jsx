import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { Toaster } from "@/components/ui/sonner"
// -------- Page import
import { Navbar, Footer } from './components/common/index'

import { Home, ProductPage, SearchPage, Login, Register, ForgotPassword, ResetPassword, Profile, Cart, Shipping, ConfirmOrder } from './pages/index'
import ProtectedRoute from './components/ProtectedRoute'
import useUserStore from '../store/useUserStore';


function App() {

  const { checkAuth } = useUserStore();
  const [stripeApiKey, setStripeApiKey] = useState("");

  useEffect(() => {
    async function getStripeKey(){
      try {
        const { data } = await axios.get("/api/v1/payment/config");
        setStripeApiKey(data.publishableKey);
      } catch (error) {
        console.error("Failed to fetch Stripe publishable key", error);
      }
    }
    getStripeKey();
  }, []);



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
          <Route path="/profile" 
            element={
              <ProtectedRoute>
                <Profile />
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
