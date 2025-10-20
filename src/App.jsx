import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useState } from "react";
import "./App.css";

import Consent from "./components/Consent";
import PreTest from "./components/test/PreTest";
import Learning from "./components/learning/Learning";
import PostTest from "./components/test/PostTest";
import Imi from "./components/Imi";
import Thankyou from "./components/Thankyou";
import Continue from "./components/Continue";
import Result from "./components/result/Result";

function App() {
  const [userData, setUserData] = useState(null);
  const [firestoreDocId, setFirestoreDocId] = useState(null);

  const updateUserData = (newData) => {
    setUserData((prevData) => ({ ...prevData, ...newData }));
  };

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Consent onConsentSubmit={updateUserData} />} />

          <Route
            path="/pretest"
            element={
              <PreTest
                userData={userData}
                setUserData={setUserData}
                setFirestoreDocId={setFirestoreDocId}
              />
            }
          />

          <Route
            path="/learning"
            element={
              <Learning
                userData={userData}
                setUserData={setUserData}
                firestoreDocId={firestoreDocId}
              />
            }
          />

          <Route
            path="/posttest"
            element={
              <PostTest
                userData={userData}
                setUserData={setUserData}
                firestoreDocId={firestoreDocId}
              />
            }
          />

          <Route
            path="/imi"
            element={
              <Imi userData={userData} setUserData={setUserData} firestoreDocId={firestoreDocId} />
            }
          />

          <Route path="/thankyou" element={<Thankyou />} />

          <Route
            path="/continue"
            element={<Continue setUserData={setUserData} setFirestoreDocId={setFirestoreDocId} />}
          />

          <Route path="/result" element={<Result />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
