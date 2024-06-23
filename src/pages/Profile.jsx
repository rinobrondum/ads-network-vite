import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import {
  collection,
  doc,
  getDocs,
  // moved to useSnapshot.jsx
  // onSnapshot,
  orderBy,
  query,
  updateDoc,
  where,
} from "firebase/firestore"
import { deleteObject, getDownloadURL, ref, uploadBytes } from "firebase/storage"
import { db, storage, auth } from "../firebaseConfig"
import { FaUserAlt, FaCloudUploadAlt } from "react-icons/fa"
import moment from "moment"
import AdCard from "../components/AdCard"
// import custom hook
import useSnapshot from "../utils/useSnapshot"

// The profile page we will send request to Firestore and get data from the users collection of particular document which is the ID of the current user. 
// We will use useParams to get the ID from the URL.

// format createdAt to month and year with moment.js
const monthAndYear = date =>
  `${moment(date).format("MMMM").slice(0, 3)} ${moment(date).format("YYYY")}`

const Profile = () => {
  // Get the ID from the URL
  const { id } = useParams()
  // create state variables and set default values
  const [img, setImg] = useState("")
  const [ads, setAds] = useState([])
  // moved to useSnapshot.jsx
  // const [user, setUser] = useState()

  // use useSnapshot custom hook
  // renamed val to user with aliasing
  const { val: user } = useSnapshot("users", id)

  // moved to useSnapshot.jsx
  // use onSnapshot if you expect data to be changed and you would like to update the UI as well because it's a real time listener. If you only want to get the data once, use getDoc.
  /*   const getUser = async () => {
    const unsub = onSnapshot(doc(db, "users", id), querySnapshot => setUser(querySnapshot.data()))

    return () => unsub()
  } */

  // only authenticated, and the person who is viewing his own profile will be able to call this function.
  const uploadImage = async () => {
    // create image reference to storage from firebaseConfig
    // provide the path where we would like to store the image and make it unique by adding a timestamp
    const imgRef = ref(storage, `profile/${Date.now()} - ${img.name}`)
    // if user has a photo, delete it and upload new one
    if (user.photoUrl) {
      await deleteObject(ref(storage, user.photoPath))
    }
    // upload image
    const result = await uploadBytes(imgRef, img)
    // get download url
    const url = await getDownloadURL(ref(storage, result.ref.fullPath))
    // update user doc, auth.currentUser.uid is the current user's id
    await updateDoc(doc(db, "users", auth.currentUser.uid), {
      // URL is to display the image on our site.
      photoUrl: url,
      // fullPath is used to delete the image from firebase storage
      photoPath: result.ref.fullPath,
    })
    // clear img state
    setImg("")
  }

  const getAds = async () => {
    // create collection reference
    const adsRef = collection(db, "ads")
    // execute query
    const q = query(adsRef, where("postedBy", "==", id), orderBy("publishedAt", "desc"))
    // get data from firestore
    const docs = await getDocs(q)
    let ads = []
    docs.forEach(doc => {
      ads.push({ ...doc.data() })
    })
    setAds(ads)
  }

  useEffect(() => {
    // moved to useSnapshot.jsx
    // getUser()
    // if img exists, call the uploadImage function
    if (img) {
      uploadImage()
    }
    getAds()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [img])

  // console.log(user)
  // console.log(img)
  // console.log(ads)

  // const deletePhoto = async () => {
  //   const confirm = window.confirm("Delete photo permanently?")
  //   if (confirm) {
  //     await deleteObject(ref(storage, user.photoPath))
  //     await updateDoc(doc(db, "users", auth.currentUser.uid), {
  //       photoUrl: "",
  //       photoPath: "",
  //     })
  //   }
  // }

  const deletePhoto = async () => {
    if (auth?.currentUser && auth.currentUser?.uid === id) {
      const confirm = window.confirm("Delete photo permanently?");
      if (confirm) {
        await deleteObject(ref(storage, user.photoPath));
        await updateDoc(doc(db, "users", auth.currentUser.uid), {
          photoUrl: "",
          photoPath: "",
        });
      }
    }
  };

  // if user exists, display user info else return null
  return user ? (
    <div className="mt-5 container row">
      <div className="text-center col-sm-2 col-md-3">
        {/* if user has an image, then show the image, else show placeholder icon */}
        {user.photoUrl ? (
          <img
            src={user.photoUrl}
            alt={user.name}
            style={{ widht: "100px", height: "100px", borderRadius: "50%" }}
          />
        ) : (
          <FaUserAlt size={50} />
        )}
        <div className="dropdown my-3 text-center">
          <button
            className="btn btn-secondary btn-sm dropdown-toggle"
            type="button"
            data-bs-toggle="dropdown"
            aria-expanded="false"
          >
            Edit
          </button>
          <ul className="dropdown-menu">
            <li>
              <label htmlFor="photo" className="dropdown-item">
                <FaCloudUploadAlt size={30} /> Upload Photo
              </label>
              <input
                type="file"
                id="photo"
                accept="image/*"
                style={{ display: "none" }}
                onChange={e => setImg(e.target.files[0])}
              />
            </li>
            {/* if the user has a profile image display remove button */}
            {user.photoUrl ? (
              <li className="dropdown-item btn" onClick={deletePhoto}>
                Remove Photo
              </li>
            ) : null}
          </ul>
        </div>
        <p>Member since {monthAndYear(user.createdAt.toDate())}</p>
      </div>
      <div className="col-sm-10 col-md-9">
        <h3>{user.name}</h3>
        <hr />
        {ads.length ? <h4>Published Ads</h4> : <h4>There are no ads published by this user</h4>}
        <div className="row">
          {ads?.map(ad => (
            <div key={ad.adId} className="col-sm-6 col-md-4 mb-3">
              <AdCard ad={ad} />
            </div>
          ))}
        </div>
      </div>
    </div>
  ) : null
}

export default Profile
