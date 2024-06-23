import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../firebaseConfig";

// used in AdCard.jsx, Ad.jsx, and Profile.jsx
const useSnapshot = (collection, docId) => {
  const [val, setVal] = useState();

  useEffect(() => {
    const docRef = doc(db, collection, docId);
    const unsub = onSnapshot(docRef, (doc) => setVal(doc.data()));
    return () => unsub();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { val };
};

export default useSnapshot;
