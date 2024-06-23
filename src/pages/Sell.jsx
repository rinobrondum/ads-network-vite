import { useState } from "react"
import { FaCloudUploadAlt } from "react-icons/fa"
import { ref, getDownloadURL, uploadBytes } from "firebase/storage"
import { addDoc, collection, doc, setDoc, Timestamp } from "firebase/firestore"
import { storage, db, auth } from "../firebaseConfig"
import { useNavigate } from "react-router-dom"

// define categories and locations for the select dropdown
const categories = ["Vehicle", "Property", "Electronics"]
const locations = ["København", "Aarhus", "Odense", "Aalborg"]

const Sell = () => {
  // useNavigate to redirect to home page
  const navigate = useNavigate()
  // setting multiple default state values, use with e.target.name attribute
  const [values, setValues] = useState({
    images: [],
    title: "",
    category: "",
    price: "",
    location: "",
    contact: "",
    description: "",
    error: "",
    loading: false,
  })
  // destructure default values from the useState getter
  const { images, title, category, price, location, contact, description, error, loading } = values

  // handle input change, spread out all values and then grab the value by name attribute
  const handleChange = e => setValues({ ...values, [e.target.name]: e.target.value })

  // handle form submit
  const handleSubmit = async e => {
    e.preventDefault()
    // validate fields
    if (images.length === 0 || !title || !category || !price || !location || !contact || !description) {
      setValues({ ...values, error: "Image upload and all fields are required" })
      return
    }
    // reset error message and set loading to true before form submission
    setValues({ ...values, error: "", loading: true })

    try {
      // We are assigning the imgs array to the images field, which is our state.
      let imgs = []
      // loop through images if any
      if (images.length) {
        for (let image of images) {
          // create a reference to the storage path
          const imgRef = ref(storage, `ads/${Date.now()} - ${image.name}`)
          // upload image to storage
          const result = await uploadBytes(imgRef, image)
          // get the download URL of the uploaded image
          const fileUrl = await getDownloadURL(ref(storage, result.ref.fullPath))
          // push the image URL and path into the imgs array
          imgs.push({ url: fileUrl, path: result.ref.fullPath })
        }
      }
      // add data into firestore
      const result = await addDoc(collection(db, "ads"), {
        // We are assigning the imgs array to the images field, which is our state.
        images: imgs,
        title,
        category,
        price: Number(price),
        location,
        contact,
        description,
        isSold: false,
        publishedAt: Timestamp.fromDate(new Date()),
        postedBy: auth.currentUser.uid,
        // adId will be appended here
      })
      //  create a document in the ads collection with the adId field
      await setDoc(
        doc(db, "ads", result.id),
        {
          adId: result.id,
        },
        // merge the id with the existing document do not overwrite
        {
          merge: true,
        }
      )
      // create a document in the favorites collection with the result ID and an empty users array
      await setDoc(doc(db, "favorites", result.id), {
        users: [],
      })

      // reset form values and navigate to home page
      setValues({
        images: [],
        title: "",
        category: "",
        price: "",
        location: "",
        contact: "",
        description,
        loading: false,
      })
      navigate("/")
      // error handling ...values will return an object with the current values state, the error property is set to the error message.
    } catch (error) {
      setValues({ ...values, error: error.message, loading: false })
    }
  }

  return (
    <form className="form shadow rounded p-3 mt-5" onSubmit={handleSubmit}>
      <h3 className="text-center mb-3">Create An Ad</h3>
      {/* file upload */}
      <div className="mb-3 text-center">
        <label htmlFor="image">
          <div className="btn btn-secondary btn-sm">
            <FaCloudUploadAlt size={30} /> Upload Image
          </div>
        </label>
        <input
          type="file"
          id="image"
          style={{ display: "none" }}
          accept="image/*"
          multiple
          // directly capture & set the images value to the selected files
          onChange={e => setValues({ ...values, images: e.target.files })}
        />
      </div>
      {/* title */}
      <div className="mb-3">
        <label className="form-label">Title</label>
        <input
          type="text"
          className="form-control"
          name="title"
          // bind the title value to the input field
          value={title}
          // call the handleChange function on input change
          onChange={handleChange}
        />
      </div>
      {/* category */}
      <div className="mb-3">
        <select name="category" className="form-select" onChange={handleChange}>
          <option value="">Select Category</option>
          {categories.map(category => (
            <option value={category} key={category}>
              {category}
            </option>
          ))}
        </select>
      </div>
      {/* price */}
      <div className="mb-3">
        <label className="form-label">Price</label>
        <input
          type="number"
          className="form-control"
          name="price"
          value={price}
          onChange={handleChange}
        />
      </div>
      {/* location */}
      <div className="mb-3">
        <select name="location" className="form-select" onChange={handleChange}>
          <option value="">Select Location</option>
          {locations.map(location => (
            <option value={location} key={location}>
              {location}
            </option>
          ))}
        </select>
      </div>
      {/* contact */}
      <div className="mb-3">
        <label className="form-label">Contact</label>
        <input
          type="text"
          className="form-control"
          name="contact"
          value={contact}
          onChange={handleChange}
        />
      </div>
      {/* description */}
      <div className="mb-3">
        <label className="form-label">Description</label>
        <textarea
          name="description"
          cols="30"
          rows="3"
          className="form-control"
          value={description}
          onChange={handleChange}
        ></textarea>
      </div>
      {/* display error message if error is not null */}
      {error ? <p className="text-center text-danger">{error}</p> : null}
      <div className="mb-3 text-center">
        <button className="btn btn-secondary btn-sm" disabled={loading}>
          Create
        </button>
      </div>
    </form>
  )
}

export default Sell
