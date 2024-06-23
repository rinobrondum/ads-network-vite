import { useState } from "react"
import { auth, db } from "../../firebaseConfig"
import { createUserWithEmailAndPassword } from "firebase/auth"
import { setDoc, doc, Timestamp } from "firebase/firestore"
import { useNavigate } from "react-router-dom"

const Register = () => {
  // setting multiple default state values, use with e.target.name attribute
  const [values, setValues] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    error: "",
    loading: false,
  })
  // useNavigate to redirect to home page
  const navigate = useNavigate()

  // destructure default values from the useState getter
  const { name, email, password, confirmPassword, error, loading } = values
  // Set values, will spread out all the values and then change the value of individual input field by its name attribute.
  const handleChange = e => setValues({ ...values, [e.target.name]: e.target.value })

  const handleSubmit = async e => {
    e.preventDefault()
    // validate fields
    if (!name || !email || !password || !confirmPassword) {
      setValues({ ...values, error: "All fields are required" })
      return
    }
    if (password !== confirmPassword) {
      setValues({ ...values, error: "Password must match" })
      return
    }
    // reset error message and set loading to true before form submission
    setValues({ ...values, error: "", loading: true })

    try {
      // register user in firestore
      const result = await createUserWithEmailAndPassword(auth, email, password)
      // create users document in firestore
      await setDoc(doc(db, "users", result.user.uid), {
        uid: result.user.uid,
        name,
        email,
        createdAt: Timestamp.fromDate(new Date()),
        isOnline: true,
      })
      // clear state, setValues back to default
      setValues({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        error: "",
        loading: false,
      })
      // redirect to home page, replace: true will remove the history entry so the user can't go back to the register page
      navigate("/", { replace: true })
      // error handling ...values will return an object with the current values state, the error property is set to the error message.
    } catch (error) {
      setValues({ ...values, error: error.message, loading: false })
    }
  }

  return (
    <form className="shadow rounded p-3 mt-5 form" onSubmit={handleSubmit}>
      <h3 className="text-center mb-3">Create An Account</h3>
      <div className="mb-3">
        <label htmlFor="name" className="form-label">
          Name
        </label>
        <input
          type="text"
          className="form-control"
          name="name"
          value={name}
          onChange={handleChange}
        />
      </div>
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
      <div className="mb-3">
        <label htmlFor="confirmPassword" className="form-label">
          Confirm Password
        </label>
        <input
          type="password"
          className="form-control"
          name="confirmPassword"
          value={confirmPassword}
          onChange={handleChange}
        />
      </div>
      {/* display error message if error is not null */}
      {error ? <p className="text-center text-danger">{error}</p> : null}
      <div className="text-center mb-3">
        {/* disable button when loading is true */}
        <button className="btn btn-secondary btn-sm" disabled={loading}>
          Register
        </button>
      </div>
    </form>
  )
}
export default Register
