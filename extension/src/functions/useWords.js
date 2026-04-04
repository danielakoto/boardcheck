
const commonWords = {
   one: [
      'a', 'i',
   ],
   two: [
      'am', 'an', 'as', 'at', 'be', 'by', 'do', 'go', 'he', 'hi',
      'if', 'in', 'is', 'it', 'me', 'my', 'no', 'of', 'on', 'or',
      'so', 'to', 'up', 'us', 'we',
   ],
   three: [
      'the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'her',
      'was', 'one', 'our', 'out', 'day', 'get', 'has', 'him', 'his', 'how',
      'man', 'new', 'now', 'old', 'see', 'two', 'way', 'who', 'boy', 'did',
      'its', 'let', 'put', 'say', 'she', 'too', 'use', 'run', 'eat', 'big',
      'fox', 'dog', 'add', 'win', 'fly',
   ],
   four: [
      'that', 'with', 'have', 'this', 'will', 'your', 'from', 'they', 'know', 'want',
      'been', 'good', 'much', 'some', 'time', 'very', 'when', 'come', 'here', 'just',
      'like', 'long', 'make', 'many', 'more', 'only', 'over', 'such', 'take', 'than',
      'them', 'well', 'were', 'what', 'also', 'back', 'call', 'came', 'each', 'even',
      'find', 'gave', 'give', 'goes', 'hand', 'help', 'high', 'hold', 'home', 'keep',
      'quick', 'lazy', 'test', 'type', 'race', 'rank', 'flow', 'bold', 'soft', 'cool',
      'dark', 'warm', 'fast', 'slow', 'year', 'part', 'play', 'move', 'live', 'show',
      'open', 'walk', 'read', 'grow', 'work', 'case', 'week', 'feel', 'word', 'port',
      'plug', 'font', 'icon', 'panel', 'frame', 'pixel', 'sharp', 'clean', 'clear',
      'light', 'heavy', 'solid', 'dense', 'loose', 'tight', 'quiet', 'score', 'skill',
   ],
   long: [
      'keyboard', 'testing', 'speed', 'typing', 'challenge', 'practice',
      'accuracy', 'focus', 'rhythm', 'precision', 'smooth',
      'letters', 'words', 'sentences', 'write', 'switch',
      'keycap', 'stabilizer', 'mount', 'layout', 'custom', 'board',
      'cherry', 'gateron', 'tactile', 'linear', 'clicky',
      'sound', 'response', 'feedback', 'satisfying', 'perfect',
      'competition', 'leaderboard', 'improvement', 'consistent', 'reliable', 'efficient',
      'people', 'place', 'company', 'question', 'bring', 'begin', 'allow', 'spend',
      'offer', 'remember', 'love', 'consider', 'appear', 'produce', 'happen',
      'window', 'finger', 'power', 'change', 'action', 'value', 'signal',
      'cable', 'connect', 'monitor', 'screen', 'display',
      'rapid', 'active', 'static', 'global', 'local',
   ],
};

// Define your difficulty anchors — add as many as you want
const difficultyAnchors = [
  { level: 1,  dist: { one: 0.15, two: 0.30, three: 0.40, four: 0.15, long: 0.00 } },
  { level: 5,  dist: { one: 0.05, two: 0.10, three: 0.35, four: 0.35, long: 0.15 } },
  { level: 10, dist: { one: 0.00, two: 0.05, three: 0.15, four: 0.35, long: 0.45 } },
  { level: 15, dist: { one: 0.00, two: 0.00, three: 0.05, four: 0.20, long: 0.75 } },
  { level: 20, dist: { one: 0.00, two: 0.00, three: 0.00, four: 0.15, long: 0.85 } }, // max hardness
];

const MAX_HARD_LEVEL = difficultyAnchors.at(-1).level;

// Smoothly interpolate between two anchors
const interpolateDist = (a, b, t) => {
  const keys = Object.keys(a);
  return Object.fromEntries(keys.map(k => [k, a[k] + (b[k] - a[k]) * t]));
};

// Get distribution for any level, clamped at max hardness
const getDistribution = (level) => {
  const clamped = Math.min(level, MAX_HARD_LEVEL);

  // Exact anchor match
  const exact = difficultyAnchors.find(a => a.level === clamped);
  if (exact) return exact.dist;

  // Find surrounding anchors and interpolate
  const lower = [...difficultyAnchors].reverse().find(a => a.level < clamped);
  const upper = difficultyAnchors.find(a => a.level > clamped);

  if (!lower) return difficultyAnchors[0].dist;
  if (!upper) return difficultyAnchors.at(-1).dist;

  const t = (clamped - lower.level) / (upper.level - lower.level);
  return interpolateDist(lower.dist, upper.dist, t);
};

export const generateWords = (count = 50, level = 1) => {
  const distribution = getDistribution(level);

  const pick = (arr, n) =>
    n <= 0 ? [] : [...arr].sort(() => Math.random() - 0.5).slice(0, n);

  const counts = {
    one:   Math.round(count * distribution.one),
    two:   Math.round(count * distribution.two),
    three: Math.round(count * distribution.three),
    four:  Math.round(count * distribution.four),
    long:  Math.round(count * distribution.long),
  };

  // Fix rounding drift
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  counts.four += count - total;

  const words = [
    ...pick(commonWords.one,   counts.one),
    ...pick(commonWords.two,   counts.two),
    ...pick(commonWords.three, counts.three),
    ...pick(commonWords.four,  counts.four),
    ...pick(commonWords.long,  counts.long),
  ].sort(() => Math.random() - 0.5);

  return words.map((word, i) => ({ word, key: `${Date.now()}-${i}` }));
};