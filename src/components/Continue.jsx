import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import { useState } from "react";
import Swal from "sweetalert2";
import { db } from "../firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

function Continue({ setUserData, setFirestoreDocId }) {
  const navigate = useNavigate();
  const [uniqueCode, setUniqueCode] = useState("");

  const handleUniqueCode = async (e) => {
    e.preventDefault();
    
    try {
      const q = query(collection(db, "users"), where("userID", "==", uniqueCode));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        Swal.fire({
          icon: 'error',
          title: 'Invalid Code',
          text: 'That code was not found. Please try again.',
          confirmButtonColor: "#053d2c",
        });
      } else {
        const docData = querySnapshot.docs[0].data();
        const docId = querySnapshot.docs[0].id;

        // Restore session state first
        setUserData(docData);
        setFirestoreDocId(docId);

        // Decide where to navigate
        if (docData.imi && docData.imi.timestamp) {
          Swal.fire({
            icon: 'info',
            title: 'Session Complete',
            text: 'You have already completed this entire session.',
            confirmButtonColor: "#053d2c",
          });
        } else if (docData.postTest && docData.postTest.timestamp) {
          navigate("/imi");
        } else if (docData.learning && docData.learning.timestamp) {
          navigate("/posttest");
        } else {
          navigate("/learning");
        }
      }
    } catch (error) {
      console.error("Error fetching user data: ", error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'There was a problem fetching your data. Please try again later.',
        confirmButtonColor: "#053d2c",
      });
    }
  };

  const handleInputCode = (e) => {
    setUniqueCode(e.target.value.toUpperCase());
  };

  return (
    <div className="continue-container">
      <Navbar />
      <main className="center">
        <h1>Welcome Back!</h1>
        <p>Please enter your code below to continue with your learning.</p>
        <form onSubmit={handleUniqueCode}>
          <input
            type="text"
            id="code"
            name="code"
            maxLength="6"
            minLength="6"
            value={uniqueCode}
            onChange={handleInputCode}
            className="code-box"
          />
          <br />
          <br />
          <button type="submit">Start Learning!</button>
        </form>
      </main>
    </div>
  );
}

export default Continue;
