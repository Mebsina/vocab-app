import { useState, useEffect } from "react";
import { distributeWordsToRegions } from "../../data/vocabularyData";
import RegionGame from "./RegionGame";
import { db } from "../../firebase";
import { collection, getDocs } from "firebase/firestore";
import "./Mapping.css";

function Mapping({ onAllRegionsComplete }) {
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [completedRegions, setCompletedRegions] = useState([]);
  const [showCelebration, setShowCelebration] = useState(false);
  const [vocabularyData, setVocabularyData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch words from Firebase and distribute across regions
  useEffect(() => {
    const fetchAndDistributeWords = async () => {
      try {
        const wordsCollectionRef = collection(db, "words");
        const querySnapshot = await getDocs(wordsCollectionRef);
        const fetchedWords = querySnapshot.docs.map(doc => doc.data());
        
        // Distribute words evenly across regions
        const distributedData = distributeWordsToRegions(fetchedWords);
        setVocabularyData(distributedData);
      } catch (error) {
        console.error("Error fetching words from Firestore: ", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAndDistributeWords();
  }, []);

  const handleRegionClick = (regionKey) => {
    setSelectedRegion(regionKey);
  };

  const handleRegionComplete = (regionKey) => {
    if (!completedRegions.includes(regionKey)) {
      const newCompletedRegions = [...completedRegions, regionKey];
      setCompletedRegions(newCompletedRegions);
      
      // Check if all regions are completed
      if (newCompletedRegions.length === Object.keys(vocabularyData).length) {
        setShowCelebration(true);
        setTimeout(() => setShowCelebration(false), 3000);
        
        // Notify parent that all regions are complete
        if (onAllRegionsComplete) {
          onAllRegionsComplete();
        }
      }
    }
    setSelectedRegion(null);
  };

  const handleBackToMap = () => {
    setSelectedRegion(null);
  };

  // Show loading state
  if (loading) {
    return (
      <div className="mapping-container">
        <div className="mapping-header">
          <h2>🗺️ Loading Vocabulary World...</h2>
          <p className="mapping-instructions">Please wait while we prepare your adventure!</p>
        </div>
      </div>
    );
  }

  // Show error if no data
  if (!vocabularyData || Object.keys(vocabularyData).length === 0) {
    return (
      <div className="mapping-container">
        <div className="mapping-header">
          <h2>⚠️ No Vocabulary Data</h2>
          <p className="mapping-instructions">Please add words to Firebase to begin.</p>
        </div>
      </div>
    );
  }

  const allRegionsCompleted = completedRegions.length === Object.keys(vocabularyData).length;

  // If a region is selected, show the game for that region
  if (selectedRegion) {
    return (
      <RegionGame
        region={vocabularyData[selectedRegion]}
        regionKey={selectedRegion}
        onComplete={handleRegionComplete}
        onBack={handleBackToMap}
      />
    );
  }

  // Otherwise, show the map
  return (
    <div className="mapping-container">
      <div className="mapping-header">
        <h2>🗺️ Vocabulary World Map</h2>
        <p className="mapping-instructions">
          Click on a region to explore and learn new words!
        </p>
        <div className="progress-tracker">
          <span className="progress-text">
            Regions Completed: {completedRegions.length} / {Object.keys(vocabularyData).length}
          </span>
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ 
                width: `${(completedRegions.length / Object.keys(vocabularyData).length) * 100}%` 
              }}
            />
          </div>
        </div>
      </div>

      {showCelebration && (
        <div className="celebration-banner">
          🎉 Congratulations! You've completed all regions! 🎉
        </div>
      )}

      <div className="map-wrapper">
        <div className="map-container">
          <img 
            src="/pixelWorld.jpeg" 
            alt="Vocabulary World Map" 
            className="world-map"
          />
          
          {Object.entries(vocabularyData).map(([key, region]) => {
            const isCompleted = completedRegions.includes(key);
            return (
              <button
                key={key}
                className={`region-button ${isCompleted ? 'completed' : ''}`}
                style={{
                  top: region.position.top,
                  left: region.position.left,
                  backgroundColor: isCompleted ? '#4CAF50' : region.color,
                }}
                onClick={() => handleRegionClick(key)}
                title={region.name}
              >
                <div className="region-button-content">
                  <span className="region-icon">
                    {isCompleted ? '✓' : '🎯'}
                  </span>
                  <span className="region-name">{region.name}</span>
                  <span className="region-theme">{region.theme}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {allRegionsCompleted && (
        <div className="completion-message">
          <h3>🌟 Excellent Work! 🌟</h3>
          <p>You've mastered all vocabulary regions!</p>
          <p>Click "Ready for the Post-Test" below to continue.</p>
        </div>
      )}

      <div className="legend">
        <h4>Legend:</h4>
        <div className="legend-items">
          <div className="legend-item">
            <span className="legend-icon incomplete">🎯</span>
            <span>Not Started</span>
          </div>
          <div className="legend-item">
            <span className="legend-icon complete">✓</span>
            <span>Completed</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Mapping;
