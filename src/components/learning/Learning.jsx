import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import FlashCard from "./FlashCard";
import { db } from "../../firebase";
import { doc, updateDoc } from "firebase/firestore";

function Learning({ userData, setUserData, firestoreDocId }) {
  const navigate = useNavigate();
  const userID = userData ? userData.userID : "";
  const isGamified = userData ? userData.isGamified : false;

  const handleComplete = async (e) => {
    e.preventDefault();

    const swalResult = await Swal.fire({
      title: "Are you sure?",
      text: "You will not be able to return to the learning session!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#053d2c",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes",
    });

    if (swalResult.isConfirmed) {
      const learningData = {
        learning: {
          timestamp: Math.floor(Date.now() / 1000),
        },
      };

      const updatedUserData = {
        ...userData,
        ...learningData,
      };

      setUserData(updatedUserData);

      // Update the document in Firebase
      if (firestoreDocId) {
        try {
          const docRef = doc(db, "users", firestoreDocId);
          await updateDoc(docRef, {
            learning: learningData.learning,
          });
          console.log("Document successfully updated with learning data.");
        } catch (error) {
          console.error("Error updating document: ", error);
        }
      } else {
        console.error("Error: No document ID found to update.");
      }

      navigate("/posttest");
    }
  };

  return (
    <>
      <main className="learning-main">
        <h1>Learning Session</h1>
        <div>
          <p className="center">
            In case you disconnect, you can use the code below to continue your learning course.
          </p>
          <p className="center">
            Unique code: <strong>{userID}</strong>
          </p>
        </div>
        <br />

        {isGamified ? (
          <div>
            <p className="center">Gamified version is under construction.</p>
          </div>
        ) : (
          <FlashCard />
        )}

        <br />
        <form onSubmit={handleComplete}>
          <button type="submit">Ready for the Post-Test</button>
          <br />
        </form>
      </main>
    </>
  );
}

export default Learning;
