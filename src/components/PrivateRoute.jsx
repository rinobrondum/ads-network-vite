import { useContext } from "react"
import { AuthContext } from "../context/auth"
import { Navigate, Outlet } from "react-router-dom"

const PrivateRoute = () => {
  // destructure the user object from the AuthContext
  const { user } = useContext(AuthContext)
  // if the user is logget out, redirect to login
  if (!user) {
    return <Navigate to="/auth/login" />
  }
  // Outlet renders the child route's element in App.jsx
  return <Outlet />
}

export default PrivateRoute
