import "./App.css"
import { BrowserRouter, Routes, Route } from "react-router-dom"
import Navbar from "./components/Navbar"
import Register from "./pages/auth/Register"
import Login from "./pages/auth/Login"
import ForgotPassword from "./pages/auth/ForgotPassword"
import Home from "./pages/Home"
import Profile from "./pages/Profile"
import AuthProvider from "./context/auth"
import PrivateRoute from "./components/PrivateRoute"
import Sell from "./pages/Sell"
import MyFavorites from "./pages/MyFavorites"
import Ad from "./pages/Ad"
import Chat from "./pages/Chat"

function App() {
  return (
    <AuthProvider>
      {/* AuthProvider children start */}
      <BrowserRouter>
        <Navbar />
        <Routes>
          {/* Outlet renders the child route's element */}
          <Route element={<PrivateRoute />}>
            {/* Child route */}
            <Route path="/sell" element={<Sell />} />
            <Route path="/favorites" element={<MyFavorites />} />
            <Route path="/chat" element={<Chat />} />
          </Route>
          <Route path="/auth/register" element={<Register />} />
          <Route path="/auth/login" element={<Login />} />
          <Route path="/auth/forgot-password" element={<ForgotPassword />} />
          <Route path="/profile/:id" element={<Profile />} />
          <Route path="/:category/:id" element={<Ad />} />
          <Route path="/" element={<Home />} />
        </Routes>
      </BrowserRouter>
      {/* AuthProvider children end */}
    </AuthProvider>
  )
}

export default App
