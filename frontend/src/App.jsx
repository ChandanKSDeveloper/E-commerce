import { BrowserRouter, Routes, Route } from 'react-router-dom'

// -------- Page import
import Navbar from './components/common/Navbar'
import Footer from './components/common/Footer'
import Home from './pages/home/Home'
function App() {
  

  return (
    <>
    <BrowserRouter>
    <Navbar/>
    <Routes>
      <Route path="/" element={<Home />} />
      {/* <Route path="/login" element={<Login />} />
      <Route path="/cart" element={<Cart />} />
      <Route path="/search" element={<Search />} /> */}
    </Routes>
    <Footer/>
    </BrowserRouter>
    </>
  )
}

export default App
