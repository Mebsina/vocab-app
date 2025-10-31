import { useState, useEffect } from 'react';
import './Timer.css';

function Timer({ startTime, onTimeUp }) {
  const DURATION = 1000 * 60; // minutes in seconds
  const [remainingTime, setRemainingTime] = useState(DURATION);

  useEffect(() => {
    const endTime = startTime + DURATION;
    const interval = setInterval(() => {
      const now = Math.floor(Date.now() / 1000);
      const secondsLeft = endTime - now;

      if (secondsLeft > 0) {
        setRemainingTime(secondsLeft);
      } else {
        setRemainingTime(0);
        clearInterval(interval);
        if (typeof onTimeUp === 'function') {
          onTimeUp();
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime, onTimeUp, DURATION]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="timer-container center">
      {remainingTime > 0 ? (
        <p>{formatTime(remainingTime)}</p>
      ) : (
        <p>Time's up!</p>
      )}
    </div>
  );
}

export default Timer;
