// ─── XP Constants ───────────────────────────────────────────────
const XP_PER_WORD        = 1.2;    // base XP per word typed
const LEVEL_BASE_XP      = 300;    // XP needed to reach level 2
const LEVEL_SCALING      = 1.22;   // steepness of XP curve per level

// ─── XP to reach the START of a given level ─────────────────────
// Level 1 starts at 0 XP. Level 2 starts at LEVEL_BASE_XP. Etc.
export const getXpForLevel = (level) => {
   if (level <= 1) return 0;
   let total = 0;
   for (let i = 1; i < level; i++) {
      total += Math.floor(LEVEL_BASE_XP * Math.pow(LEVEL_SCALING, i - 1));
   }
   return total;
};

// XP required to advance FROM level N to level N+1
export const getXpRequiredForLevelUp = (level) =>
   Math.floor(LEVEL_BASE_XP * Math.pow(LEVEL_SCALING, level - 1));

// ─── XP Earned per Test ─────────────────────────────────────────
export const calculateXpEarned = ({ wordsTyped, accuracy, wpm }) => {
   const base = Math.floor(wordsTyped * XP_PER_WORD);

   // Accuracy multiplier: 0.5× at 0% → 1.5× at 100%
   const accuracyMultiplier = 0.5 + (accuracy / 100);

   // Speed bonus: +0% at 40wpm, +50% at 120wpm, capped at +100%
   const speedBonus = Math.min(2.0, 1 + Math.max(0, (wpm - 40) / 160));

   return Math.floor(base * accuracyMultiplier * speedBonus);
};

// ─── Level from Total XP ────────────────────────────────────────
export const getLevel = (totalXp) => {
   let level = 1;

   while (totalXp >= getXpForLevel(level + 1)) {
      level++;
   }

   const xpForCurrent = getXpForLevel(level);
   const xpForNext    = getXpForLevel(level + 1);
   const xpIntoLevel  = totalXp - xpForCurrent;
   const xpNeeded     = xpForNext - xpForCurrent;

   return {
      level,
      totalXp,
      xpIntoLevel,                                        // XP earned within current level
      xpNeeded,                                           // XP span of current level
      xpToNextLevel: Math.max(0, xpForNext - totalXp),    // XP still needed to level up
      progress: Math.min(100, Math.round((xpIntoLevel / xpNeeded) * 100)),
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
   if (wpm >= 110) return { label: 'Professional',  color: '#00e5a0' }; // 110-119 — faster than most office workers
   if (wpm >= 100) return { label: 'Proficient',    color: '#00d4a0' }; // 100-109 — clean, confident typing
   if (wpm >= 90)  return { label: 'Skilled',       color: '#20c4b8' }; // 90-99  — clearly above average
   if (wpm >= 80)  return { label: 'Fluent',        color: '#40b4d0' }; // 80-89  — typing feels natural
   if (wpm >= 70)  return { label: 'Capable',       color: '#60b4f0' }; // 70-79  — solid, reliable typist
   if (wpm >= 62)  return { label: 'Developing',    color: '#80a8f8' }; // 62-69  — above average but room to grow
   if (wpm >= 55)  return { label: 'Hunting',       color: '#a0a0ff' }; // 55-61  — true population median
   if (wpm >= 48)  return { label: 'Casual',        color: '#a8b8f8' }; // 48-54  — functional everyday typing
   if (wpm >= 40)  return { label: 'Average',       color: '#b0c8f0' }; // 40-47  — noticeable hesitation
   if (wpm >= 33)  return { label: 'Clumsy',        color: '#c0d0e8' }; // 33-39  — frequent corrections
   if (wpm >= 27)  return { label: 'Hunting',       color: '#f0d080' }; // 27-32  — likely hunt-and-peck
   if (wpm >= 21)  return { label: 'Pecking',       color: '#f0b870' }; // 21-26  — one finger territory
   if (wpm >= 15)  return { label: 'Struggling',    color: '#f09060' }; // 15-20  — labored, painful to watch
   if (wpm >= 8)   return { label: 'Crawling',      color: '#f06060' }; // 8-14   — key by key
   return          { label: 'Noob',                 color: '#ff2c2c' }; // 0-7    — barely moving
};