import { FlashcardArray } from "react-quizlet-flashcard";
import "react-quizlet-flashcard/dist/index.css";
import { useState, useEffect } from "react";
import { db } from "../../firebase";
import { collection, getDocs } from "firebase/firestore";

function FlashCard() {
  const [wordsFromFirestore, setWordsFromFirestore] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWords = async () => {
      try {
        const wordsCollectionRef = collection(db, "words");
        const querySnapshot = await getDocs(wordsCollectionRef);
        const fetchedWords = querySnapshot.docs.map(doc => doc.data());
        setWordsFromFirestore(fetchedWords);
      } catch (error) {
        console.error("Error fetching words from Firestore: ", error);
      } finally {
        setLoading(false);
      }
    };
    fetchWords();
  }, []);

  if (loading) {
    return <div className="center">Loading words...</div>;
  }

  if (wordsFromFirestore.length === 0) {
    return <div className="center">No words available.</div>;
  }

  const deck = wordsFromFirestore.map((word, index) => ({
    id: word.word || index,
    front: {
      html: (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100%",
            width: "100%",
            textAlign: "center",
          }}
        >
          {word.word}
        </div>
      ),
    },
    back: {
      html: (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100%",
            width: "100%",
            textAlign: "center",
            padding: "20px",
            boxSizing: "border-box",
          }}
        >
          {word.definition}
        </div>
      ),
    },
  }));

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <FlashcardArray
        deck={deck}
        frontContentStyle={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          fontSize: "2.5rem",
          fontWeight: "bold",
          backgroundColor: "#fff",
          color: "#054d2c",
          width: "100%",
          height: "100%",
          textAlign: "center",
        }}
        backContentStyle={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          fontSize: "2.5rem",
          backgroundColor: "#f0f0f0",
          color: "black",
          width: "100%",
          height: "100%",
          padding: "20px",
          boxSizing: "border-box",
          textAlign: "center",
        }}
      />
    </div>
  );
}

export default FlashCard;
