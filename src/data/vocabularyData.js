// Region metadata (visual and theme information)
// Words will be dynamically loaded from Firebase and distributed evenly
export const regionMetadata = {
  region1: {
    name: "Region 1",
    theme: "Vocabulary Zone 1",
    color: "#2d5016",
    position: { top: "35%", left: "15%" },
  },
  region2: {
    name: "Region 2",
    theme: "Vocabulary Zone 2",
    color: "#1a4d7a",
    position: { top: "25%", left: "50%" },
  },
  region3: {
    name: "Region 3",
    theme: "Vocabulary Zone 3",
    color: "#0a4d68",
    position: { top: "60%", left: "70%" },
  },
  region4: {
    name: "Region 4",
    theme: "Vocabulary Zone 4",
    color: "#6b2d5c",
    position: { top: "45%", left: "82%" },
  },
  region5: {
    name: "Region 5",
    theme: "Vocabulary Zone 5",
    color: "#1a1a2e",
    position: { top: "15%", left: "75%" },
  }
};

// Function to distribute Firebase words evenly across regions
export const distributeWordsToRegions = (firebaseWords) => {
  const regionKeys = Object.keys(regionMetadata);
  const numRegions = regionKeys.length;
  
  // Create a copy of region metadata with empty words arrays
  const vocabularyData = {};
  regionKeys.forEach(key => {
    vocabularyData[key] = {
      ...regionMetadata[key],
      words: []
    };
  });
  
  // Distribute words evenly across regions
  firebaseWords.forEach((wordData, index) => {
    const regionIndex = index % numRegions;
    const regionKey = regionKeys[regionIndex];
    
    // Transform Firebase word format to game format
    // Firebase has: { word: "...", definition: "...", alternatives?: [...] }
    // Game needs: { word: "...", correctDefinition: "...", definitions: [...] }
    
    // Get alternative definitions from Firebase or create placeholders
    const alt1 = wordData.alternatives?.[0] || `Alternative meaning of ${wordData.word}`;
    const alt2 = wordData.alternatives?.[1] || `Another definition for ${wordData.word}`;
    
    const gameWord = {
      word: wordData.word,
      correctDefinition: wordData.definition,
      definitions: shuffleArray([
        wordData.definition,  // Correct definition
        alt1,                 // Alternative 1
        alt2                  // Alternative 2
      ])
    };
    
    vocabularyData[regionKey].words.push(gameWord);
  });
  
  return vocabularyData;
};

// Helper function to get all words across all regions
export const getAllWords = (vocabularyData) => {
  const allWords = [];
  Object.keys(vocabularyData).forEach(regionKey => {
    vocabularyData[regionKey].words.forEach(word => {
      allWords.push({
        ...word,
        region: regionKey,
        regionName: vocabularyData[regionKey].name
      });
    });
  });
  return allWords;
};

// Helper function to shuffle array
export const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};
