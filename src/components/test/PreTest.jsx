import Navbar from "../Navbar";
import Test from "./Test";

function PreTest({ userData, setUserData, setFirestoreDocId }) {
  return (
    <Test
      navbar={<Navbar />}
      title="Pre-Test"
      submitButtonText="Start Learning!"
      onSubmitNavigateTo="/learning"
      setUserData={setUserData}
      userData={userData}
      setFirestoreDocId={setFirestoreDocId}
    />
  );
}

export default PreTest;
