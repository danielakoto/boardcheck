const BASE_WORDS = 500;       // words needed for level 1 → 2
const SCALING_FACTOR = 1.18;  // how steeply requirements grow per level

export const getWordsForLevel = (level) =>
   Math.floor(BASE_WORDS * Math.pow(SCALING_FACTOR, level - 1));

export const getLevel = (totalWords) => {
   let level = 1;

   while (totalWords >= getWordsForLevel(level)) {
      level++;
   }

   const wordsForNext    = getWordsForLevel(level);
   const wordsForCurrent = getWordsForLevel(level - 1);

   return {
      level: level,
      next: {
         wordsNeeded: Math.max(0, wordsForNext - totalWords),
         wordsProgress: Math.min(100, Math.round(
            ((totalWords - wordsForCurrent) / (wordsForNext - wordsForCurrent)) * 100
         )),
      },
   };
};

// Grade label based on WPM
export const getRank = (wpm) => {
   if (wpm >= 280) return { label: 'Omniscient',   color: '#ffffff' };
   if (wpm >= 260) return { label: 'Transcendent', color: '#ff6fff' };
   if (wpm >= 240) return { label: 'Mythic',       color: '#e040fb' };
   if (wpm >= 220) return { label: 'Legendary',    color: '#ffd700' };
   if (wpm >= 200) return { label: 'Grandmaster',  color: '#ffaa00' };
   if (wpm >= 175) return { label: 'Master',       color: '#f07612' };
   if (wpm >= 150) return { label: 'Expert',       color: '#ff6b35' };
   if (wpm >= 120) return { label: 'Elite',        color: '#60d890' };
   if (wpm >= 100) return { label: 'Advanced',     color: '#00e5a0' };
   if (wpm >= 75)  return { label: 'Proficient',   color: '#60b4f0' };
   if (wpm >= 55)  return { label: 'Skilled',      color: '#a0c8ff' };
   if (wpm >= 35)  return { label: 'Average',      color: '#7ec8e3' };
   if (wpm >= 25)  return { label: 'Developing',   color: '#f0c060' };
   if (wpm >= 15)  return { label: 'Beginner',     color: '#f09060' };
   return          { label: 'Noob',                color: '#ff2c2c' };
};