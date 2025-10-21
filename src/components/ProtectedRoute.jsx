import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

function ProtectedRoute({ firestoreDocId, children }) {
  const navigate = useNavigate();

  useEffect(() => {
    if (!firestoreDocId) {
      // Redirect to home page if userID is not found
      navigate("/");
    }
    // Re-run effect if firestoreDocId changes
  }, [firestoreDocId, navigate]);

  // Render children only if firestoreDocId exists
  return firestoreDocId ? <>{children}</> : null;
}

export default ProtectedRoute;
