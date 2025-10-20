import { useNavigate } from "react-router-dom";
import imiData from "../assets/imi_questions.json";
import { useState } from "react";
import { db } from "../firebase";
import { doc, updateDoc } from "firebase/firestore";

const allQuestions = [
  ...imiData.motivationalExperience.flatMap((section) => section.questions),
  ...imiData.behavioralOutcome.flatMap((section) => section.questions),
];

function Imi({ userData, setUserData, firestoreDocId }) {
  const navigate = useNavigate();
  const [answers, setAnswers] = useState({});

  const handleAnswerChange = (questionName, value) => {
    setAnswers((prevAnswers) => ({
      ...prevAnswers,
      [questionName]: parseInt(value, 10),
    }));
  };

  const handleImi = async (e) => {
    e.preventDefault();

    const imiAnswers = {
      answers: answers,
      timestamp: Math.floor(Date.now() / 1000),
    };

    const updatedUserData = {
      ...userData,
      imi: imiAnswers,
    };

    setUserData(updatedUserData);
    console.log("User Data: ", JSON.stringify(updatedUserData, null, 2));

    if (firestoreDocId) {
      try {
        const docRef = doc(db, "users", firestoreDocId);
        await updateDoc(docRef, { imi: imiAnswers });
        console.log("Document updated with IMI data.");
      } catch (error) {
        console.error("Error updating document: ", error);
      }
    } else {
      console.error("Error: No document ID found to update.");
    }

    navigate("/thankyou");
  };

  return (
    <main className="center">
      <h1>The Intrinsic Motivation Inventory</h1>
      <p>Please rate how much you agree with each statement</p>
      <p>
        1 = Strongly Disagree, 2 = Disagree,
        <span style={{ whiteSpace: "nowrap" }}> 3 = Neutral, 4 = Agree,</span>
        <span style={{ whiteSpace: "nowrap" }}> 5 = Strongly Agree</span>
      </p>

      <form onSubmit={handleImi}>
        {allQuestions.map((question, index) => {
          return (
            <div key={question}>
              <p>
                {index + 1}. {question}
              </p>
              <div>
                {[1, 2, 3, 4, 5].map((value, radioIndex) => {
                  const id = `${question}_${value}`;
                  return (
                    <label className="imi-box" key={id}>
                      <input
                        type="radio"
                        id={id}
                        name={question}
                        value={value}
                        checked={answers[question] === value}
                        onChange={(e) => handleAnswerChange(question, e.target.value)}
                        required={radioIndex === 0}
                      />
                      {value}
                    </label>
                  );
                })}
              </div>
              <br />
            </div>
          );
        })}

        <br />
        <button type="submit">Submit</button>
        <br />
      </form>
    </main>
  );
}

export default Imi;
