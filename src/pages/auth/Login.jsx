import { useState } from "react"
import { auth, db } from "../../firebaseConfig"
import { signInWithEmailAndPassword } from "firebase/auth"
import { doc, updateDoc } from "firebase/firestore"
import { useNavigate, Link } from "react-router-dom"

const Login = () => {
  // setting multiple default state values, use with e.target.name attribute
  const [values, setValues] = useState({
    email: "",
    password: "",
    error: "",
    loading: false,
  })
  // useNavigate to redirect to home page
  const navigate = useNavigate()

  // destructure default values from the useState getter
  const { email, password, error, loading } = values
  // Set values, will spread out all the values and then change the value of individual input field by its name attribute.
  const handleChange = e => setValues({ ...values, [e.target.name]: e.target.value })

  const handleSubmit = async e => {
    e.preventDefault()
    // validate fields
    if (!email || !password) {
      setValues({ ...values, error: "All fields are required" })
      return
    }
    // clear error message and set loading to true
    setValues({ ...values, error: "", loading: true })

    try {
      // login user in firestore
      const result = await signInWithEmailAndPassword(auth, email, password)
      // update users doc
      await updateDoc(doc(db, "users", result.user.uid), {
        isOnline: true,
      })
      // clear state, setValues back to default
      setValues({
        email: "",
        password: "",
        error: "",
        loading: false,
      })
      // redirect to home page, replace: true will remove the history entry so the user can't go back to the login page
      navigate("/", { replace: true })
      // error handling ...values will return an object with the current values state, the error property is set to the error message.
    } catch (error) {
      setValues({ ...values, error: error.message, loading: false })
    }
  }

  return (
    <form className="shadow rounded p-3 mt-5 form" onSubmit={handleSubmit}>
      <h3 className="text-center mb-3">Log Into Your Account</h3>
      <div className="mb-3">
        <label htmlFor="email" className="form-label">
          Email
        </label>
        <input
          type="email"
          className="form-control"
          name="email"
          value={email}
          onChange={handleChange}
        />
      </div>
      <div className="mb-3">
        <label htmlFor="password" className="form-label">
          Password
        </label>
        <input
          type="password"
          className="form-control"
          name="password"
          value={password}
          onChange={handleChange}
        />
      </div>
      {/* display error message if error is not null */}
      {error ? <p className="text-center text-danger">{error}</p> : null}
      <div className="text-center mb-3">
        {/* disable button when loading is true */}
        <button className="btn btn-secondary btn-sm" disabled={loading}>
          Login
        </button>
      </div>
      <div className="text-center mb-3">
        <small>
          <Link to="/auth/forgot-password">Forgot Password</Link>
        </small>
      </div>
    </form>
  )
}
export default Login
