/* eslint-disable react/prop-types */
import { Link } from "react-router-dom"
import { AiOutlineHeart, AiFillHeart } from "react-icons/ai"
import { auth } from "../firebaseConfig"
import useSnapshot from "../utils/useSnapshot"
import { toggleFavorite } from "../utils/fav"
import Sold from "../components/Sold"

// recieve ad as a prop from parent component and destructure it
const AdCard = ({ ad }) => {
  // use useSnapshot custom hook
  const { val } = useSnapshot("favorites", ad.adId)
  // create a dynamic link for each ad
  const adLink = `/${ad.category.toLowerCase()}/${ad.adId}`

  return (
    <div className="card position-relative">
      {/* if the ad is sold, we will show a Sold component */}
      {ad.isSold && <Sold />}
      <Link to={adLink}>
        <img
          src={ad.images[0].url}
          alt={ad.title}
          className="card-img-top"
          style={{ width: "100%", height: "200px" }}
        />
      </Link>
      <div className="card-body">
        <p className="d-flex justify-content-between align-items-center">
          <small>{ad.category}</small>
          {val?.users?.includes(auth.currentUser?.uid) ? (
            // if the user has marked the ad as favorite, we will show a filled heart icon
            <AiFillHeart
              size={30}
              onClick={() => toggleFavorite(val.users, ad.adId)}
              className="text-danger"
            />
          ) : (
            // otherwise, we will show an outlined heart icon
            <AiOutlineHeart
              size={30}
              onClick={() => toggleFavorite(val.users, ad.adId)}
              className="text-danger"
            />
          )}
        </p>
        <Link to={adLink}>
          <h5 className="card-title">{ad.title}</h5>
        </Link>
        <Link to={adLink}>
          <p className="card-text">
            {ad.location} - {ad.publishedAt.toDate().toDateString()}
            <br />
            DKR. {Number(ad.price).toLocaleString()}
          </p>
        </Link>
      </div>
    </div>
  )
}

export default AdCard
