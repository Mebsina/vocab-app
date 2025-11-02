import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import FlashCard from "./FlashCard";
import VocabSprint from "./VocabSprint";
import Mapping from "./Mapping";
import { db } from "../../firebase";
import { doc, updateDoc } from "firebase/firestore";
import Timer from "./Timer";
import "./Timer.css";

function Learning({ userData, setUserData, firestoreDocId }) {
  const navigate = useNavigate();
  const userID = userData ? userData.userID : "";
  const isGamified = userData ? userData.isGamified : false;
  const gameType = userData ? userData.gameType : "vocabsprint"; // "vocabsprint" or "mapping"
  // const preTestTimestamp = userData?.preTest?.timestamp; // Used by VocabSprint internally
  const [isMappingComplete, setIsMappingComplete] = useState(false);
  const [showPractice, setShowPractice] = useState(false);

  const navigateToPostTest = async () => {
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
  };

  // Timer handler - used by VocabSprint game
  // const handleTimeUp = () => {
  //   Swal.fire({
  //     title: "Time's Up!",
  //     text: "You will be automatically directed to the post-test screen.",
  //     timer: 10000,
  //     timerProgressBar: true,
  //     showConfirmButton: true,
  //     confirmButtonColor: "#053d2c",
  //     confirmButtonText: "Take the Post-Test",
  //   }).then(() => {
  //     navigateToPostTest();
  //   });
  // };

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
      navigateToPostTest();
    }
  };

  return (
    <>
      {isGamified && (
        <div className="learning-header-fixed">
          <div className="unique-code-banner">
            <span className="code-label">Your Unique Code:</span>
            <span className="code-value">{userID}</span>
            <span className="code-hint">(Save this to continue later)</span>
          </div>
        </div>
      )}
      
      <main className="learning-main">
        <h1>Learning Session</h1>
        {!isGamified && (
          <div>
            <p className="center">
              In case you disconnect, you can use the code below to continue your learning course.
            </p>
            <p className="center">
              Unique code: <strong>{userID}</strong>
            </p>
          </div>
        )}
        <br />

        {isGamified ? (
          <div>
            {gameType === "vocabsprint" ? (
              <div>
                {/* VocabSprint only game */}
                <div>
                  <VocabSprint />
                </div>
              </div>
            ) : (
              /* Mapping game type: Play Mapping first (teaching), then VocabSprint (practice) */
              <div>
                {!isMappingComplete ? (
                  /* Step 1: Teaching phase - Mapping game */
                  <Mapping onAllRegionsComplete={() => setIsMappingComplete(true)} />
                ) : (
                  /* Step 2: Show proceed screen, then practice phase - VocabSprint */
                  <div>
                    {!showPractice ? (
                      <div style={{ 
                        backgroundColor: '#4CAF50', 
                        color: 'white', 
                        padding: '18px', 
                        textAlign: 'center',
                        marginBottom: '20px',
                        borderRadius: '10px'
                      }}>
                        <h3 style={{ margin: '0 0 10px 0' }}>🎉 Teaching Phase Complete!</h3>
                        <p style={{ margin: '0 0 14px 0' }}>Great job finishing all regions with 100% accuracy.</p>
                        <button
                          type="button"
                          onClick={() => setShowPractice(true)}
                          style={{
                            backgroundColor: '#053d2c',
                            color: 'white',
                            border: 'none',
                            padding: '10px 16px',
                            borderRadius: '8px',
                            fontWeight: 600,
                            cursor: 'pointer'
                          }}
                        >
                          Start Vocab Velocity!
                        </button>
                      </div>
                    ) : (
                      <VocabSprint />
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <FlashCard />
        )}

        <br />
        <form onSubmit={handleComplete}>
          <button 
            type="submit" 
            disabled={isGamified && gameType === "mapping" && !isMappingComplete}
            style={{
              opacity: (isGamified && gameType === "mapping" && !isMappingComplete) ? 0.5 : 1,
              cursor: (isGamified && gameType === "mapping" && !isMappingComplete) ? 'not-allowed' : 'pointer'
            }}
          >
            Ready for the Post-Test
          </button>
          {isGamified && gameType === "mapping" && !isMappingComplete && (
            <p className="center" style={{ color: '#ff9800', fontWeight: 'bold', marginTop: '10px' }}>
              ⚠️ Complete the teaching phase (all regions with 100% accuracy) to proceed
            </p>
          )}
          <br />
        </form>
      </main>
    </>
  );
}

export default Learning;
