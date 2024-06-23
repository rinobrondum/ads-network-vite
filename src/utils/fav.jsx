import { updateDoc, doc } from "firebase/firestore"
import { db, auth } from "../firebaseConfig"

// we are passing users array and adId to this function
export const toggleFavorite = async (users, adId) => {
  // first we are checking whether this user has logged in or not
  // if there is a user true else false
  let isFav = users.includes(auth.currentUser.uid)

  await updateDoc(doc(db, "favorites", adId), {
    // if the user has marked the ad as favourite then the user will be in the users array
    users: isFav
      ? // when clicking the favorite button, we will filter out the user from favorite list with array.filter method
        users.filter(id => id !== auth.currentUser.uid)
        // otherwise, we will add the user in favorite list
      : users.concat(auth.currentUser.uid),
  })
}
