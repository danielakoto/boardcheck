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
  if (wpm >= 280) return { label: 'Omniscient',    color: '#ffffff' }; // 280+
  if (wpm >= 260) return { label: 'Transcendent',  color: '#ff6fff' }; // 260-279
  if (wpm >= 240) return { label: 'Mythic',        color: '#e040fb' }; // 240-259
  if (wpm >= 220) return { label: 'Legendary',     color: '#ffd700' }; // 220-239
  if (wpm >= 200) return { label: 'Grandmaster',   color: '#ffaa00' }; // 200-219
  if (wpm >= 175) return { label: 'Master',        color: '#f07612' }; // 175-199
  if (wpm >= 150) return { label: 'Expert',        color: '#ff6b35' }; // 150-174
  if (wpm >= 120) return { label: 'Elite',         color: '#60d890' }; // 120-149
  if (wpm >= 110) return { label: 'Specialist',    color: '#00e5a0' }; // 110-119
  if (wpm >= 100) return { label: 'Advanced',      color: '#00d4a0' }; // 100-109
  if (wpm >= 90)  return { label: 'Capable',       color: '#20c4b8' }; // 90-99
  if (wpm >= 80)  return { label: 'Proficient',    color: '#40b4d0' }; // 80-89
  if (wpm >= 70)  return { label: 'Competent',     color: '#60b4f0' }; // 70-79
  if (wpm >= 62)  return { label: 'Skilled',       color: '#80a8f8' }; // 62-69
  if (wpm >= 55)  return { label: 'Practiced',     color: '#a0a0ff' }; // 55-61
  if (wpm >= 48)  return { label: 'Steady',        color: '#a8b8f8' }; // 48-54
  if (wpm >= 40)  return { label: 'Average',       color: '#b0c8f0' }; // 40-47
  if (wpm >= 33)  return { label: 'Casual',        color: '#c0d0e8' }; // 33-39
  if (wpm >= 27)  return { label: 'Developing',    color: '#f0d080' }; // 27-32
  if (wpm >= 21)  return { label: 'Learning',      color: '#f0b870' }; // 21-26
  if (wpm >= 15)  return { label: 'Beginner',      color: '#f09060' }; // 15-20
  if (wpm >= 8)   return { label: 'Novice',        color: '#f06060' }; // 8-14
  return          { label: 'Noob',                 color: '#ff2c2c' }; // 0-7
};