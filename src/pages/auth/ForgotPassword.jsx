import { useState } from "react"
import { auth } from "../../firebaseConfig"
import { sendPasswordResetEmail } from "firebase/auth"

// ForgotPassword component will be used to reset the password of the user, here we will ask for the email of the user and send him the reset link.

const ForgotPassword = () => {
  // setting individual state variables and default values
  const [email, setEmail] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const handleSubmit = async e => {
    e.preventDefault()
    // validate field
    if (!email) {
      setError("Email is required")
      return
    }
    // before making the request, clear error message and set success to false
    setError("")
    setSuccess(false)

    try {
      // use firebase auth function to send password reset email
      // it takes auth from firebaseConfig file and email from state
      await sendPasswordResetEmail(auth, email)
      setSuccess(true)
      // clear input field after successful request
      setEmail("")
      // error handling
    } catch (error) {
      setError(error.message)
    }
  }
  return (
    <form className="shadow rounded p-3 mt-5 form" onSubmit={handleSubmit}>
      <h3 className="text-center mb-3">Forgot Password</h3>
      {/* if success is true, show message */}
      {success ? (
        <p className="text-center mt-5">An e-mail is sent containing password reset instructions</p>
      ) : (
        <>
          {/* if success is false, show the form */}
          <div className="mb-3">
            <label htmlFor="email" className="form-label">
              Email
            </label>
            <input
              type="email"
              className="form-control"
              name="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>
          {/* display error message if error is not null */}
          {error ? <p className="text-center text-danger">{error}</p> : null}
          <div className="text-center mb-3">
            <button className="btn btn-secondary btn-sm">Send</button>
          </div>
        </>
      )}
    </form>
  )
}

export default ForgotPassword
