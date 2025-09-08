import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { db } from '../firebaseConfig';
import { collection, addDoc, query, where, getDocs, orderBy, serverTimestamp, doc, getDoc, deleteDoc } from 'firebase/firestore';

const Review = ({ adId, user }) => {
  const [reviews, setReviews] = useState([]);
  const [text, setText] = useState('');
  const [rating, setRating] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  // Delete review and update state instantly
  const handleDelete = async (reviewId) => {
    await deleteDoc(doc(db, 'reviews', reviewId));
    setReviews(prev => prev.filter(r => r.id !== reviewId));
  };

  // Check if current user is admin
  useEffect(() => {
    const checkAdmin = async () => {
      if (user && user.uid) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setIsAdmin(!!userData.isAdmin);
        }
      }
    };
    checkAdmin();
  }, [user]);

  const fetchReviews = async () => {
    setLoading(true);
    const q = query(
      collection(db, 'reviews'),
      where('adId', '==', adId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    // Fetch user info for each review
    const fetchedReviews = await Promise.all(querySnapshot.docs.map(async (reviewDoc) => {
      const reviewData = reviewDoc.data();
      let userProfile = { name: 'Anonymous', photoUrl: '' };
      if (reviewData.uid) {
        const userDoc = await getDoc(doc(db, 'users', reviewData.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          userProfile = { name: userData.name || 'Anonymous', photoUrl: userData.photoUrl || '' };
        }
      }
      return {
        id: reviewDoc.id,
        ...reviewData,
        userProfile
      };
    }));
    setReviews(fetchedReviews);
    setLoading(false);
  };
  useEffect(() => {
    fetchReviews();
    // Only run when adId changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim() || rating < 1 || rating > 5) return;
    await addDoc(collection(db, 'reviews'), {
      adId,
      uid: user?.uid || null,
      text,
      rating,
      createdAt: serverTimestamp()
    });
    setText('');
    setRating(0);
    // Refresh reviews
    fetchReviews();
  };

  return (
    <div className="review-section">
      <h3>Customer Reviews</h3>
      {loading ? <p>Loading...</p> : (
        <ul>
          {reviews.length === 0 ? <li>No reviews yet.</li> : reviews.map((r) => (
            <li key={r.id} style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
              {r.userProfile.photoUrl ? (
                <img src={r.userProfile.photoUrl} alt={r.userProfile.name} style={{ width: 32, height: 32, borderRadius: '50%', marginRight: 8 }} />
              ) : (
                <span style={{ width: 32, height: 32, borderRadius: '50%', background: '#eee', display: 'inline-block', marginRight: 8 }} />
              )}
              <strong>{r.userProfile.name}:</strong> <span style={{ marginLeft: 8 }}>{r.text}</span>
              {/* Show star rating */}
              <span style={{ marginLeft: 8 }}>
                {[1,2,3,4,5].map(star => (
                  <span key={star} style={{ color: star <= r.rating ? '#FFD700' : '#ccc', fontSize: '1.2rem' }}>★</span>
                ))}
              </span>
              {/* Show delete button for review owner or admin */}
              {(user?.uid === r.uid || isAdmin) && (
                <button
                  onClick={() => handleDelete(r.id)}
                  style={{
                    marginLeft: 'auto',
                    background: '#eee',
                    color: '#333',
                    border: 'none',
                    borderRadius: '4px',
                    padding: '4px 10px',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    transition: 'background 0.2s',
                  }}
                  onMouseOver={e => (e.target.style.background = '#ccc')}
                  onMouseOut={e => (e.target.style.background = '#eee')}
                >
                  Delete
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
      {user && (
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '10px' }}>
            <span>Rating <span style={{color:'red'}}>*</span>: </span>
            {[1,2,3,4,5].map(star => (
              <span
                key={star}
                style={{
                  cursor: 'pointer',
                  color: star <= rating ? '#FFD700' : '#ccc',
                  fontSize: '1.5rem',
                  marginRight: 2
                }}
                onClick={() => setRating(star)}
                onMouseOver={() => setRating(star)}
                onMouseOut={() => setRating(rating)}
              >★</span>
            ))}
            <span style={{color:'red', marginLeft:'8px', fontSize:'0.95rem'}}>Star rating is required</span>
          </div>
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Write your review..."
            required
            rows={5}
            style={{ width: '100%', fontSize: '1rem', padding: '10px', resize: 'vertical' }}
          />
          <button
            type="submit"
            style={{
              backgroundColor: '#888',
              color: '#fff',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '4px',
              cursor: 'pointer',
              transition: 'background 0.2s',
              marginTop: '10px'
            }}
            onMouseOver={e => (e.target.style.backgroundColor = '#555')}
            onMouseOut={e => (e.target.style.backgroundColor = '#888')}
          >
            Submit Review
          </button>
        </form>
      )}
    </div>
  );
};
Review.propTypes = {
  adId: PropTypes.string.isRequired,
  user: PropTypes.shape({
    uid: PropTypes.string,
    displayName: PropTypes.string,
    photoURL: PropTypes.string,
  }),
};

export default Review;
