import { useState, useEffect, useRef } from 'react';
import { db } from '../../firebase';
import { collection, getDocs } from 'firebase/firestore';
import "./VocabSprint.css";

// Helper function to shuffle an array
function shuffleArray(array) {
    for(let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Time allowed per question in seconds
const TIME_PER_QUESTION = 10;

function VocabSprint() {
  const [gameState, setGameState] = useState("loading"); // loading, playing, finished
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIME_PER_QUESTION); // 60 seconds for the game

  const [streak, setStreak] = useState(0); // current correct answer streak
  const [scoreFeedback, setScoreFeedback] = useState(null); // feedback message for score changes

  // reference for the timer interval to easily clear it later
  const timerIntervalRef = useRef(null);

  // reference for game container to display feedback
  const gameContainerRef = useRef(null);

  // 1. Fetch words from Firestore on component mount
  useEffect(() => {
    const fetchWords = async () => {
      try {
        const wordsCollectionRef = collection(db, 'words');
        const querySnapshot = await getDocs(wordsCollectionRef);
        const fetchedWords = querySnapshot.docs.map(doc => doc.data());

        if(fetchedWords.length < 4) {
            console.error("Not enough words in the Firebase to start the game.");
            setGameState("loading");
            return;
        }

        const allDefinitions = fetchedWords.map(word => word.definition);

        // Prepare questions with one correct answer and three random wrong answers
        const preparedQuestions = fetchedWords.map(word => {
          const correctAnswer = word.definition;
          const wrongAnswers = allDefinitions.filter(def => def !== correctAnswer);
          const shuffledWrongAnswers = shuffleArray(wrongAnswers).slice(0, 3);

          const options = shuffleArray([
            { text: correctAnswer, isCorrect: true },
            ...shuffledWrongAnswers.map(def => ({ text: def, isCorrect: false }))
          ]);

          return {
            word: word.word,
            options: options
          };
        });

        setQuestions(shuffleArray(preparedQuestions));
        setGameState("playing");
      } catch (error) {
        console.error("Error fetching words from Firestore: ", error);
      }
    };

    fetchWords();
  }, []);

    // 2. Handle timer
    useEffect(() => {
        if(gameState === "playing") {
            if(timerIntervalRef.current) {
                clearInterval(timerIntervalRef.current);
            }

            setTimeLeft(TIME_PER_QUESTION);

            timerIntervalRef.current = setInterval(() => {
                setTimeLeft(prevTime => {
                    if(prevTime <= 1) {
                        clearInterval(timerIntervalRef.current);
                        handleTimeUp();
                        return 0;
                    }
                    return prevTime - 1;
                });
            }, 1000);
        }

        return () => {
            if(timerIntervalRef.current) {
                clearInterval(timerIntervalRef.current);
            }
        };  
    }, [gameState, currentQuestionIndex]);

    // Effect to clear the score feedback pop-up
    useEffect(() => {
    if(scoreFeedback) {
        const timer = setTimeout(() => {
            setScoreFeedback(null);
        }, 800); // feedback visible for 800ms
        return () => clearTimeout(timer);
    }
    }, [scoreFeedback]);

    // Handle moving to next question or ending game when time is up
    const moveToNextOrEndGame = () => {
        const isLastQuestion = currentQuestionIndex >= questions.length - 1;

        if(isLastQuestion) {
            setTimeout(() => {
                setGameState("ended");
            }, 750);
        } else {
            setCurrentQuestionIndex(prevIndex => prevIndex + 1);
        }
    };

    // Handle when time is up for a question
    const handleTimeUp = () => {
        if(gameState !== "playing") return;

        // Time's up, treat as incorrect answer
        setScore((prevScore) => (prevScore > 0 ? prevScore - 50 : 0));
        setStreak(0);
        setScoreFeedback(`-50 points!`);
        displayFeedback(false);

        moveToNextOrEndGame();
    }

    // 3. Handle clicked answer
    const handleAnswerClick = (isCorrect) => {
        if(gameState !== "playing") return; // Do nothing if game is not active

        // Stop the timer for the current question
        if(timerIntervalRef.current) {
            clearInterval(timerIntervalRef.current);
        }

        if(isCorrect) {

            const secondsElapsed = TIME_PER_QUESTION - timeLeft;
            const pointsWon = Math.max(50, 150 - (secondsElapsed * 10));

            setScore(prevScore => prevScore + pointsWon);
            setScoreFeedback(`+${pointsWon} points!`);

            setStreak(prevStreak => prevStreak + 1);
            displayFeedback(true);
        } else {
            setScore((prevScore) => (prevScore > 0 ? prevScore - 50 : 0));
            setStreak(0);
            setScoreFeedback(`-50 points!`);
            displayFeedback(false);
        }

        // Move to next question or end game if it was the last question
        moveToNextOrEndGame();
    };

    // 4. Display visual feedback
    const displayFeedback = (isCorrect) => {
        const feedbackClass = isCorrect ? "correct-feedback" : "incorrect-feedback";
        if(gameContainerRef.current) {
            gameContainerRef.current.classList.add(feedbackClass);
            setTimeout(() => {
                if(gameContainerRef.current) {
                    gameContainerRef.current.classList.remove(feedbackClass);
                }
            }, 300);
        }
    };

  // 5. Render component based on game state
  if(gameState === "loading") {
      return <div className="center">Loading game...</div>;
  }

  if(gameState === "ended") {
      return (
          <div className="vocab-sprint-container center fade-in">
              <h2>Game Over!</h2>
              <p className="vocab-sprint-end-screen">Your final score: {score}</p>
              <p>Please click the button below to continue.</p>
          </div>
      );
  }

  const currentQuestion = questions[currentQuestionIndex];

  // Track progress of user
  const progressPercent = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
      <div className="vocab-sprint-container" ref={gameContainerRef}>
          {scoreFeedback && (
              <div className={`score-popup ${scoreFeedback.startsWith('+') ? 'correct' : 'incorrect'}`}>
                  {scoreFeedback}
              </div>
          )}

          <div className="vocab-sprint-stats">
              <span id="vocab-sprint-timer" className={timeLeft <= 10 ? 'timer-low' : ''}>
                Time Left: {timeLeft}s
              </span>
              <span className="vocab-sprint-streak">
                Streak: {streak} 🔥
              </span>
              <span id="vocab-sprint-score">Score: {score}</span>
          </div>

          <div className="question-timer-container">
            <div
                key={currentQuestionIndex}
                className="question-timer-bar"
            ></div>
          </div>

          <div className="vocab-sprint-progress-bar">
              <div className="progress-text">
                    Question {currentQuestionIndex + 1} of {questions.length}
              </div>
              <div className="progress-bar-outline">
                <div
                    className="progress-bar-fill"
                    style={{ width: `${progressPercent}%` }}
                ></div>
              </div>
          </div>

          <h2 id="vocab-sprint-word-display">{currentQuestion.word}</h2>
          <div id="vocab-sprint-answer-buttons">
                {currentQuestion.options.map((option, index) => (
                    <button
                        key={index}
                        className={`vocab-sprint-btn btn-color-${index}`}
                        onClick={() => handleAnswerClick(option.isCorrect)}
                    >
                        {option.text}
                    </button>
                ))}
          </div>
      </div>
  );
}

export default VocabSprint;