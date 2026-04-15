import { BrowserRouter, Routes, Route } from 'react-router-dom'

import { Toaster } from "@/components/ui/sonner"
// -------- Page import
import Navbar from './components/common/Navbar'
import Footer from './components/common/Footer'
import Home from './pages/home/Home'
import ProductPage from './pages/ProductPage'

function App() {


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
          {/* <Route path="/login" element={<Login />} />
      <Route path="/cart" element={<Cart />} />
      <Route path="/search" element={<Search />} /> */}
          <Route path='/product/:id' element={<ProductPage />} />
        </Routes>
        <Footer />
      </BrowserRouter>
    </>
  )
}

export default App
