import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import Navbar from "../Navbar";
import "./PostTestScore.css";

function PostTestScore({ userData }) {
  const navigate = useNavigate();

  useEffect(() => {
    if (!userData || !userData.postTest) {
      navigate("/posttest");
    }
  }, [userData, navigate]);

  if (!userData || !userData.postTest) {
    return null;
  }

  const { score, total, percentage } = userData.postTest;
  const preTestPercentage = userData.preTest ? userData.preTest.percentage : null;
  const improvement = preTestPercentage !== null ? percentage - preTestPercentage : null;

  // Determine score category for styling
  const getScoreCategory = () => {
    if (percentage >= 90) return "excellent";
    if (percentage >= 80) return "great";
    if (percentage >= 70) return "good";
    if (percentage >= 60) return "fair";
    return "needs-improvement";
  };

  const scoreCategory = getScoreCategory();

  return (
    <>
      <Navbar />
      <main className="score-main">
        <div className="score-container">
          <h1 className="score-title">Post-Test Complete!</h1>
          
          <div className="score-display">
            <div className={`score-circle ${scoreCategory}`}>
              <div className="score-circle-inner">
                <div className="score-percentage">{Math.round(percentage)}%</div>
                <div className="score-fraction">{score}/{total}</div>
              </div>
            </div>
            
            <div className="score-info">
              <p className="score-label">Final Score</p>
              <p className="score-description">
                You answered <strong>{score}</strong> out of <strong>{total}</strong> questions correctly
              </p>
            </div>
          </div>

          {preTestPercentage !== null && improvement !== null && (
            <div className="improvement-section">
              <div className="comparison-cards">
                <div className="comparison-card pre-test">
                  <div className="comparison-label">Pre-Test</div>
                  <div className="comparison-score">{Math.round(preTestPercentage)}%</div>
                </div>
                <div className="comparison-arrow">→</div>
                <div className="comparison-card post-test">
                  <div className="comparison-label">Post-Test</div>
                  <div className="comparison-score">{Math.round(percentage)}%</div>
                </div>
              </div>
              
              {improvement > 0 && (
                <div className="improvement-badge positive">
                  <span className="improvement-icon">📈</span>
                  <span className="improvement-text">
                    Improved by {improvement.toFixed(1)}%
                  </span>
                </div>
              )}
              {improvement === 0 && (
                <div className="improvement-badge neutral">
                  <span className="improvement-text">No change</span>
                </div>
              )}
              {improvement < 0 && (
                <div className="improvement-badge negative">
                  <span className="improvement-icon">📉</span>
                  <span className="improvement-text">
                    Changed by {improvement.toFixed(1)}%
                  </span>
                </div>
              )}
            </div>
          )}

          <div className="score-actions">
            <button onClick={() => navigate("/imi")} className="continue-button">
              Continue to Survey
            </button>
          </div>
        </div>
      </main>
    </>
  );
}

export default PostTestScore;

