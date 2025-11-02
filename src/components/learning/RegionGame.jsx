import { useState, useEffect } from "react";
import { shuffleArray } from "../../data/vocabularyData";
import "./RegionGame.css";

function RegionGame({ region, regionKey, onComplete, onBack }) {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [shuffledDefinitions, setShuffledDefinitions] = useState([]);
  const [selectedDefinition, setSelectedDefinition] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [firstAttemptCorrect, setFirstAttemptCorrect] = useState([]);

  const currentWord = region.words[currentWordIndex];
  const totalWords = region.words.length;
  const isLastWord = currentWordIndex === totalWords - 1;

  // Shuffle definitions when word changes
  useEffect(() => {
    if (currentWord) {
      setShuffledDefinitions(shuffleArray(currentWord.definitions));
      setSelectedDefinition(null);
      setFeedback(null);
    }
  }, [currentWordIndex, currentWord]);

  const handleDefinitionSelect = (definition) => {
    if (feedback) return; // Prevent selection after answer is given

    setSelectedDefinition(definition);
    const isFirstAttemptForThisWord = !firstAttemptCorrect[currentWordIndex];
    setAttempts(attempts + 1);

    if (definition === currentWord.correctDefinition) {
      setFeedback({
        type: "correct",
        message: "🎉 Correct! Great job!"
      });
      setScore(score + 1);
      
      // Track if this was correct on first attempt
      if (isFirstAttemptForThisWord) {
        const newFirstAttempts = [...firstAttemptCorrect];
        newFirstAttempts[currentWordIndex] = true;
        setFirstAttemptCorrect(newFirstAttempts);
      }
    } else {
      setFeedback({
        type: "incorrect",
        message: `❌ Not quite. The correct definition is: "${currentWord.correctDefinition}"`
      });
      
      // Mark this word as incorrect on first attempt
      if (isFirstAttemptForThisWord) {
        const newFirstAttempts = [...firstAttemptCorrect];
        newFirstAttempts[currentWordIndex] = false;
        setFirstAttemptCorrect(newFirstAttempts);
      }
    }
  };

  const handleNext = () => {
    if (isLastWord) {
      // Check if all words were correct on first attempt
      const perfectScore = firstAttemptCorrect.every(correct => correct === true) && 
                          firstAttemptCorrect.length === totalWords;
      
      if (perfectScore) {
        // Complete the region
        onComplete(regionKey);
      } else {
        // Show retry message - user must try again
        setFeedback({
          type: "retry",
          message: "You must get all words correct on the first attempt to complete this region. Let's try again!"
        });
      }
    } else {
      // Move to next word
      setCurrentWordIndex(currentWordIndex + 1);
      setFeedback(null);
      setSelectedDefinition(null);
    }
  };

  const handleRetry = () => {
    // Reset everything for retry
    setCurrentWordIndex(0);
    setScore(0);
    setAttempts(0);
    setFirstAttemptCorrect([]);
    setFeedback(null);
    setSelectedDefinition(null);
  };

  const handleBackToMap = () => {
    onBack();
  };

  return (
    <div className="region-game-container">
      <div className="region-game-header">
        <button className="back-button" onClick={handleBackToMap}>
          ← Back to Map
        </button>
        <div className="region-info">
          <h2>{region.name}</h2>
          <p className="region-theme-text">{region.theme}</p>
        </div>
        <div className="game-progress">
          <span>Word {currentWordIndex + 1} of {totalWords}</span>
          <div className="mini-progress-bar">
            <div 
              className="mini-progress-fill" 
              style={{ width: `${((currentWordIndex + 1) / totalWords) * 100}%` }}
            />
          </div>
        </div>
      </div>

      <div className="game-content">
        <div className="word-display">
          <h3 className="instruction-text">
            Select the correct definition for:
          </h3>
          <div className="word-card">
            <span className="word-text">{currentWord.word}</span>
          </div>
        </div>

        <div className="definitions-container">
          <p className="context-clue-hint">
            💡 Use context clues to determine which definition matches the word in the theme: <strong>{region.theme}</strong>
          </p>
          
          <div className="definitions-grid">
            {shuffledDefinitions.map((definition, index) => {
              const isSelected = selectedDefinition === definition;
              const isCorrect = definition === currentWord.correctDefinition;
              
              let buttonClass = "definition-button";
              if (feedback && isSelected) {
                buttonClass += feedback.type === "correct" ? " correct-answer" : " incorrect-answer";
              }
              if (feedback && isCorrect && !isSelected) {
                buttonClass += " show-correct";
              }

              return (
                <button
                  key={index}
                  className={buttonClass}
                  onClick={() => handleDefinitionSelect(definition)}
                  disabled={feedback !== null}
                >
                  <span className="definition-number">{String.fromCharCode(65 + index)}</span>
                  <span className="definition-text">{definition}</span>
                </button>
              );
            })}
          </div>
        </div>

        {feedback && (
          <div className={`feedback-box ${feedback.type}`}>
            <p className="feedback-message">{feedback.message}</p>
            {feedback.type === "retry" ? (
              <button className="next-button" onClick={handleRetry}>
                🔄 Try Again
              </button>
            ) : (
              <button className="next-button" onClick={handleNext}>
                {isLastWord ? "Complete Region 🎯" : "Next Word →"}
              </button>
            )}
          </div>
        )}
      </div>

      <div className="game-stats">
        <div className="stat-item">
          <span className="stat-label">Score:</span>
          <span className="stat-value">{score} / {totalWords}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Accuracy:</span>
          <span className="stat-value">
            {attempts > 0 ? Math.round((score / attempts) * 100) : 0}%
          </span>
        </div>
      </div>
    </div>
  );
}

export default RegionGame;
