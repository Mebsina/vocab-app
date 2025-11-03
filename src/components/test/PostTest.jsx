import Test from "./Test";

function PostTest({ userData, setUserData, firestoreDocId }) {
  return (
    <Test
      title="Post-Test"
      submitButtonText="Submit"
      onSubmitNavigateTo="/posttest-score"
      setUserData={setUserData}
      userData={userData}
      firestoreDocId={firestoreDocId}
    />
  );
}

export default PostTest;
