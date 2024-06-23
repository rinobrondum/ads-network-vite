import { signOut } from "firebase/auth"
import { doc, updateDoc } from "firebase/firestore"
import { useContext } from "react"
import { Link, useNavigate } from "react-router-dom"
import { AuthContext } from "../context/auth"
import { auth, db } from "../firebaseConfig"

const Navbar = () => {
  // destructure the user & unread from the AuthContext
  const { user, unread } = useContext(AuthContext)
  const navigate = useNavigate()

  const handleSignout = async () => {
    // update users doc
    await updateDoc(doc(db, "users", user.uid), {
      isOnline: false,
    })
    // logout
    await signOut(auth)
    // navigate to login
    navigate("/auth/login")
  }

  return (
    <nav className="navbar navbar-expand-md bg-light navbar-light sticky-top shadow-sm">
      <div className="container">
        <Link className="navbar-brand" to="/">
          Ads Network
        </Link>
         {/* hamburger menu */}
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarSupportedContent"
          aria-controls="navbarSupportedContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarSupportedContent">
          <ul className="navbar-nav ms-auto mb-2 mb-lg-0">
            {/* if the user is logged in, display Profile & logout links */}
            {user ? (
              <>
                <li className="nav-item">
                {/* if length is greater than zero, there are unread messages */}
                  <Link className="nav-link position-relative" to="/chat">
                    Chat
                    {unread.length ? (
                      // if there are unread messages, display a red circle with a bootstrap badge
                      <span className="position-absolute top-10 start-90 translate-middle p-1 bg-danger border border-light rounded-circle">
                        <span className="visually-hidden">New alerts</span>
                      </span>
                    ) : null}
                  </Link>
                </li>
                <li className="nav-item">
                  {/* get the user from the AuthContext */}
                  <Link className="nav-link" to={`/profile/${user.uid}`}>
                    Profile
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to={`/sell`}>
                    Sell
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to={`/favorites`}>
                    My Favorites
                  </Link>
                </li>
                <button className="btn btn-danger btn-sm" onClick={handleSignout}>
                  Logout
                </button>
              </>
            ) : (
              <>
                {/* if the user is not logged in, display Register & Login links */}
                <li className="nav-item">
                  <Link className="nav-link" to="/auth/register">
                    Register
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/auth/login">
                    Login
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
