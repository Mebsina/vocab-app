// Region metadata (visual and theme information)
// Words will be dynamically loaded from Firebase and distributed evenly
export const regionMetadata = {
  region1: {
    name: "Region 1",
    theme: "Arrangement & Relation",
    color: "#2d5016",
    position: { top: "35%", left: "15%" },
  },
  region2: {
    name: "Region 2",
    theme: "Feeling & Attitude",
    color: "#1a4d7a",
    position: { top: "25%", left: "50%" },
  },
  region3: {
    name: "Region 3",
    theme: "Quality & State",
    color: "#0a4d68",
    position: { top: "60%", left: "70%" },
  },
  region4: {
    name: "Region 4",
    theme: "Sound & Voice",
    color: "#6b2d5c",
    position: { top: "45%", left: "82%" },
  },
  region5: {
    name: "Region 5",
    theme: "Time & Change",
    color: "#1a1a2e",
    position: { top: "15%", left: "75%" },
  }
};

// Function to distribute Firebase words based on theme
export const distributeWordsToRegions = (firebaseWords) => {
  const vocabularyData = {};
  const themeToRegionMap = {};

  // Initialize vocabularyData and create a map from theme to region
  Object.keys(regionMetadata).forEach(regionKey => {
    const region = regionMetadata[regionKey];
    vocabularyData[regionKey] = {
      ...region,
      words: []
    };
    themeToRegionMap[region.theme] = regionKey;
  });

  // Distribute words to regions based on their theme
  firebaseWords.forEach(wordData => {
    const regionKey = themeToRegionMap[wordData.theme];
    if (regionKey) {
      const gameWord = {
        word: wordData.word,
        theme: wordData.theme,
        correctDefinition: wordData.definition,
        definitions: shuffleArray([
          wordData.definition,
          ...(wordData.wrongDef || [`Wrong definition of ${wordData.word}`, `Wrong definition for ${wordData.word}`])
        ])
      };
      vocabularyData[regionKey].words.push(gameWord);
    }
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
