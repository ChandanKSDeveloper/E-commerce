import { BrowserRouter, Routes, Route } from 'react-router-dom'

import { Toaster } from "@/components/ui/sonner"
// -------- Page import
import { Navbar, Footer } from './components/common/index'

import { Home, ProductPage, SearchPage } from './pages/index'


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
          <Route path="/search" element={<SearchPage />} />
          <Route path='/product/:id' element={<ProductPage />} />
        </Routes>
        <Footer />
      </BrowserRouter>
    </>
  )
}

export default App
