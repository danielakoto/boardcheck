const BASE_WORDS = 500;       // words needed for level 1 → 2
const BASE_TESTS = 3;         // tests needed for level 1 → 2
const SCALING_FACTOR = 1.18;  // how steeply requirements grow per level

export const getWordsForLevel = (level) =>
   Math.floor(BASE_WORDS * Math.pow(SCALING_FACTOR, level - 1));

export const getTestsForLevel = (level) =>
   Math.floor(BASE_TESTS * Math.pow(SCALING_FACTOR, level - 1));

export const getLevel = (totalWords, testsCompleted) => {
   let level = 1;

   while (
      totalWords >= getWordsForLevel(level) &&
      testsCompleted >= getTestsForLevel(level)
   ) {
      level++;
   }

   const wordsForNext  = getWordsForLevel(level);
   const testsForNext  = getTestsForLevel(level);
   const wordsForCurrent = getWordsForLevel(level - 1);
   const testsForCurrent = getTestsForLevel(level - 1);

   return {
      level: level - 1,
      next: {
         wordsNeeded:  Math.max(0, wordsForNext - totalWords),
         testsNeeded:  Math.max(0, testsForNext - testsCompleted),
         // progress percentages for UI progress bars
         wordsProgress: Math.min(100, Math.round(
            ((totalWords - wordsForCurrent) / (wordsForNext - wordsForCurrent)) * 100
         )),
         testsProgress: Math.min(100, Math.round(
            ((testsCompleted - testsForCurrent) / (testsForNext - testsForCurrent)) * 100
         )),
      },
   };
};

// Grade label based on WPM
export const getRank = (wpm) => {
   if (wpm >= 280) return { label: 'Omniscient',      color: '#ffffff' }; // 280-300
   if (wpm >= 260) return { label: 'Transcendent',    color: '#ff6fff' }; // 260-279
   if (wpm >= 240) return { label: 'Mythic',          color: '#e040fb' }; // 240-259
   if (wpm >= 220) return { label: 'Legendary',       color: '#ffd700' }; // 220-239
   if (wpm >= 200) return { label: 'Grandmaster',     color: '#ffaa00' }; // 200-219
   if (wpm >= 175) return { label: 'Master',          color: '#f07612' }; // 175-199
   if (wpm >= 150) return { label: 'Expert',          color: '#ff6b35' }; // 150-174
   if (wpm >= 120) return { label: 'Elite',           color: '#60d890' }; // 120-149
   if (wpm >= 100) return { label: 'Advanced',        color: '#00e5a0' }; // 100-119
   if (wpm >= 75)  return { label: 'Proficient',      color: '#60b4f0' }; // 80-99
   if (wpm >= 55)  return { label: 'Skilled',         color: '#a0c8ff' }; // 60-79
   if (wpm >= 35)  return { label: 'Average',         color: '#7ec8e3' }; // 45-59
   if (wpm >= 25)  return { label: 'Developing',      color: '#f0c060' }; // 30-44
   if (wpm >= 15)  return { label: 'Beginner',        color: '#f09060' }; // 15-29
   return          { label: 'Noob',        color: '#ff2c2c' }; // 0-14
};