import { useState, useEffect } from "react"
import { useParams, useNavigate, Link, useLocation } from "react-router-dom"
import { deleteDoc, doc, getDoc, setDoc, updateDoc } from "firebase/firestore"
import { auth, db, storage } from "../firebaseConfig"
import { ref, deleteObject } from "firebase/storage"
import { AiOutlineHeart, AiFillHeart } from "react-icons/ai"
import { FaTrashAlt, FaUserCircle } from "react-icons/fa"
import { FiPhoneCall } from "react-icons/fi"
// import custom hook
import useSnapshot from "../utils/useSnapshot"
import { toggleFavorite } from "../utils/fav"
import Sold from "../components/Sold"

const Ad = () => {
  const { id } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const [ad, setAd] = useState()
  const [idx, setIdx] = useState(0)
  const [seller, setSeller] = useState()
  const [showNumber, setShowNumber] = useState(false)
  // initialize custom hook
  const { val } = useSnapshot("favorites", id)

  const getAd = async () => {
    // get ads id from firestore
    const docRef = doc(db, "ads", id)
    const docSnap = await getDoc(docRef)
    if (docSnap.exists()) {
      setAd(docSnap.data())
      // get user id from firestore
      const sellerRef = doc(db, "users", docSnap.data().postedBy)
      const sellerSnap = await getDoc(sellerRef)

      if (sellerSnap.exists()) {
        setSeller(sellerSnap.data())
      }
    }
  }

  useEffect(() => {
    getAd()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  // console.log(ad)

  const deleteAd = async () => {
    const confirm = window.confirm(`Delete ${ad.title}?`)
    if (confirm) {
      // delete images
      for (const image of ad.images) {
        const imgRef = ref(storage, image.path)
        await deleteObject(imgRef)
      }
      // delete fav doc from firestore
      await deleteDoc(doc(db, "favorites", id))
      // delete ad doc from firestore
      await deleteDoc(doc(db, "ads", id))
      // navigate to seller profile
      navigate(`/profile/${auth.currentUser.uid}`)
    }
  }
  // function to update ad status to sold or not sold
  const updateStatus = async () => {
    await updateDoc(doc(db, "ads", id), {
      isSold: true,
    })
    getAd()
  }
  // onClick a document is created in messages collection in Firestore
  const createChatroom = async () => {
    // ID will be a combination of ad ID, buyer and seller ID
    // get the logged in user ID
    const loggedInUser = auth.currentUser.uid

    const chatId =
      // compare the logged in user ID with the ad creator ID (who is logged in)
      loggedInUser > ad.postedBy
        ? // if its the loggedInUser, format the chatId as below
          `${loggedInUser}.${ad.postedBy}.${id}`
        : // if its the ad creator, format the chatId as below
          `${ad.postedBy}.${loggedInUser}.${id}`

    // create a document in messages collection in Firestore
    await setDoc(doc(db, "messages", chatId), {
      // specify the fields (the ad ID and the users who are chatting)
      ad: id,
      users: [loggedInUser, ad.postedBy],
    })
    // navigate option state: (send the ad along with the request to the chat page)
    navigate("/chat", { state: { ad } })
  }

  return ad ? (
    <div className="mt-5 container">
      <div className="row">
        {/* bootstrap carousel on left */}
        <div id="carouselExample" className="carousel slide col-md-8 position-relative">
          {/* if the ad is sold, we will show a Sold component */}
          {/* pass singleAd prop to fix styling */}
          {ad.isSold && <Sold singleAd={true} />}
          <div className="carousel-inner">
            {ad.images.map((image, i) => (
              <div className={`carousel-item ${idx === i ? "active" : ""}`} key={i}>
                <img
                  src={image.url}
                  className="d-block w-100"
                  alt={ad.title}
                  // style={{ height: "600px" }}
                />
                <button
                  className="carousel-control-prev"
                  type="button"
                  data-bs-target="#carouselExample"
                  data-bs-slide="prev"
                  onClick={() => setIdx(i)}
                >
                  <span className="carousel-control-prev-icon" aria-hidden="true"></span>
                  <span className="visually-hidden">Previous</span>
                </button>
                <button
                  className="carousel-control-next"
                  type="button"
                  data-bs-target="#carouselExample"
                  data-bs-slide="next"
                  onClick={() => setIdx(i)}
                >
                  <span className="carousel-control-next-icon" aria-hidden="true"></span>
                  <span className="visually-hidden">Next</span>
                </button>
              </div>
            ))}
          </div>
        </div>
        <div className="col-md-4">
          {/* Details card on right */}
          <div className="card">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="card-title">DKR. {Number(ad.price).toLocaleString()}</h5>
                {/* only show favorites that belongs to the logged in user */}
                {val?.users?.includes(auth.currentUser?.uid) ? (
                  <AiFillHeart
                    size={30}
                    onClick={() => toggleFavorite(val.users, id)}
                    className="text-danger cursor"
                  />
                ) : (
                  // else show and empthy heart
                  <AiOutlineHeart
                    size={30}
                    onClick={() => toggleFavorite(val.users, id)}
                    className="text-danger cursor"
                  />
                )}
              </div>
              <h6 className="card-subtitle mb-2">{ad.title}</h6>
              <div className="d-flex justify-content-between">
                <p className="card-text">
                  {ad.location} - <small>{ad.publishedAt.toDate().toDateString()}</small>
                </p>
                {/* only show thrash icon if the ad belongs to the logged in user */}
                {ad.postedBy === auth.currentUser?.uid && (
                  <FaTrashAlt size={20} className="text-danger cursor" onClick={deleteAd} />
                )}
              </div>
            </div>
          </div>
          {/* Seller Description card on right */}
          <div className="card mt-3">
            <div className="card-body">
              <h5 className="card-title">Seller Description</h5>
              {/* link to seller profile/user id */}
              <Link to={`/profile/${ad.postedBy}`}>
                <div className="d-flex align-items-center">
                  {seller?.photoUrl ? (
                    <img
                      src={seller.photoUrl}
                      alt={seller.name}
                      style={{
                        width: "50px",
                        height: "50px",
                        borderRadius: "50%",
                        marginRight: "10px",
                      }}
                    />
                  ) : (
                    <FaUserCircle size={30} className="me-2" />
                  )}
                  <h6>{seller?.name}</h6>
                </div>
              </Link>
            </div>
            <div>
              {/* show this if user is logged in */}
              {auth.currentUser ? (
                <div className="text-center">
                  {showNumber ? (
                    <p>
                      <FiPhoneCall size={20} /> {ad.contact}
                    </p>
                  ) : (
                    <button
                      className="btn btn-secondary btn-sm mb-3"
                      onClick={() => setShowNumber(true)}
                    >
                      Show Contact Info
                    </button>
                  )}
                  <br />
                  {/* show button to the logged in user who is not the creator of the ad */}
                  {ad.postedBy !== auth.currentUser?.uid && (
                    // onClick a document is created in messages collection in Firestore
                    <button className="btn btn-secondary btn-sm mb-3" onClick={createChatroom}>
                      Chat With Seller
                    </button>
                  )}
                </div>
              ) : (
                <p className="text-center">
                  {/* show this if user is not logged in */}
                  <Link to="/auth/login" state={{ from: location }} className="text-primary">
                    Login
                  </Link>{" "}
                  to see contact info
                </p>
              )}
            </div>
          </div>
          {/* mark as sold button */}
          <div className="mt-5 text-center">
            {/* if ad.isSold is false, which means AD is not already sold and ad.postedBy is the current user then display this button. */}
            {!ad.isSold && ad.postedBy === auth.currentUser?.uid && (
              <button className="btn btn-secondary btn-sm" onClick={updateStatus}>
                Mark as Sold
              </button>
            )}
          </div>
        </div>
      </div>
      {/* description */}
      <div className="mt-5">
        <h3>Description</h3>
        <p>{ad.description}</p>
      </div>
    </div>
  ) : null
}

export default Ad
