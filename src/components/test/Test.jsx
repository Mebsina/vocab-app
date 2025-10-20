import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { db } from "../../firebase";
import { collection, setDoc, doc, updateDoc, getDocs, query, where } from "firebase/firestore";

function Test({
  title,
  userData,
  setUserData,
  submitButtonText,
  onSubmitNavigateTo,
  navbar,
  setFirestoreDocId,
  firestoreDocId,
}) {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [wordsFromFirestore, setWordsFromFirestore] = useState([]); // New state for words

  // Fetch words from Firestore on component mount
  useEffect(() => {
    const fetchWords = async () => {
      try {
        const wordsCollectionRef = collection(db, "words");
        const querySnapshot = await getDocs(wordsCollectionRef);
        const fetchedWords = querySnapshot.docs.map(doc => doc.data());
        setWordsFromFirestore(fetchedWords);
      } catch (error) {
        console.error("Error fetching words from Firestore: ", error);
      }
    };
    fetchWords();
  }, []);

  // Generating questions for the test (now depends on wordsFromFirestore)
  useEffect(() => {
    if (wordsFromFirestore.length > 0) {
      const generateQuestions = () => {
        const allDefinitions = wordsFromFirestore.map((word) => word.definition);

        // Create a question for each word.
        const generatedQuestions = wordsFromFirestore.map((word) => {
          const correctAnswer = word.definition;

          const wrongAnswers = allDefinitions.filter((definition) => definition !== correctAnswer);

          // Shuffle the wrong answers and take the first 3.
          const shuffledWrongAnswers = wrongAnswers.sort(() => 0.5 - Math.random());

          // Create an array of choices with the correct answer + 3 wrong answers.
          const choices = [correctAnswer, ...shuffledWrongAnswers.slice(0, 3)].sort(
            () => 0.5 - Math.random()
          );

          return {
            word: word.word,
            choices: choices.map((choice) => ({ text: choice, value: choice })),
          };
        });
        setQuestions(generatedQuestions);
      };
      generateQuestions();
    }
  }, [wordsFromFirestore]); // Dependency on fetched words

  const handleAnswerChange = (questionWord, selectedValue) => {
    setAnswers((prevAnswers) => ({
      ...prevAnswers,
      [questionWord]: selectedValue,
    }));
  };

  // Generate a unique 6-letter user code
  const generateCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "";
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Score the test
    let score = 0;
    wordsFromFirestore.forEach((wordData) => {
      const userAnswer = answers[wordData.word];
      const correctAnswer = wordData.definition;
      if (userAnswer === correctAnswer) {
        score++;
      }
    });

    const total = wordsFromFirestore.length;
    const percentage = total > 0 ? (score / total) * 100 : 0;

    const testData = {
      testType: title,
      answers: answers,
      score: score,
      total: total,
      percentage: percentage,
      timestamp: Math.floor(Date.now() / 1000),
    };

    if (title === "Pre-Test") {
      try {
        const userCollection = collection(db, "users");

        // Get user count to determine gamification status
        const querySnapshot = await getDocs(userCollection);
        const userCount = querySnapshot.size;
        // Odd user is gamified
        const isGamified = userCount % 2 !== 0; 

        // Ensure userID is unique
        let uniqueUserID;
        let isUnique = false;
        while (!isUnique) {
          uniqueUserID = generateCode();
          // Check the database
          const q = query(userCollection, where("userID", "==", uniqueUserID));
          const snapshot = await getDocs(q);
          if (snapshot.empty) {
            isUnique = true;
          }
        }

        const finalUserData = {
          userID: uniqueUserID,
          ...userData,
          isGamified: isGamified,
          preTest: testData,
          learning: null,
          postTest: null,
          imi: null,
        };
        setUserData(finalUserData);

        // Use setDoc with the uniqueUserID as the document ID
        await setDoc(doc(db, "users", uniqueUserID), finalUserData);
        console.log("Document written with custom ID: ", uniqueUserID);

        // Save uniqueUserID to the App state
        setFirestoreDocId(uniqueUserID);
      } catch (error) {
        console.error("Error adding document: ", error);
      }
    } else if (title === "Post-Test") {
      const finalUserData = {
        ...userData,
        postTest: testData,
      };
      setUserData(finalUserData);

      if (firestoreDocId) {
        try {
          const docRef = doc(db, "users", firestoreDocId);
          await updateDoc(docRef, { postTest: testData });
          console.log("Document updated with Post-Test data.");
        } catch (error) {
          console.error("Error updating document: ", error);
        }
      } else {
        console.error("Error: No document ID found to update.");
      }
    }

    navigate(onSubmitNavigateTo);
  };

  return (
    <>
      {navbar}
      <main>
        <h1 className="center">{title}</h1>
        <form onSubmit={handleSubmit}>
          {questions.map((question, index) => (
            <div key={question.word}>
              <h2>
                {index + 1}. {question.word}
              </h2>
              {question.choices.map((choice) => {
                const choiceID = `${question.word}-${choice.value}`;
                return (
                  <label className="choice-box" key={choiceID}>
                    <input
                      type="radio"
                      id={choiceID}
                      name={question.word}
                      value={choice.value}
                      checked={answers[question.word] === choice.value}
                      onChange={() => handleAnswerChange(question.word, choice.value)}
                      required
                    />
                    {choice.text}
                  </label>
                );
              })}
              <br />
            </div>
          ))}
          <button type="submit">{submitButtonText}</button>
          <br />
        </form>
      </main>
    </>
  );
}

export default Test;
