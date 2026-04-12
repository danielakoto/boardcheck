/* eslint-disable no-undef */
export const commonWords = {
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
    'like', 'five', 'make', 'many', 'more', 'only', 'over', 'such', 'take', 'than',
    'them', 'well', 'were', 'what', 'also', 'back', 'call', 'came', 'each', 'even',
    'find', 'gave', 'give', 'goes', 'hand', 'help', 'high', 'hold', 'home', 'keep',
    'lazy', 'test', 'type', 'race', 'rank', 'flow', 'bold', 'soft', 'cool',
    'dark', 'warm', 'fast', 'slow', 'year', 'part', 'play', 'move', 'live', 'show',
    'open', 'walk', 'read', 'grow', 'work', 'case', 'week', 'feel', 'word', 'port',
    'plug', 'font', 'icon',
  ],
  five: [
    // ← moved from your `four` (all are 5 letters)
    'quick', 'panel', 'frame', 'pixel', 'sharp', 'clean', 'clear',
    'light', 'heavy', 'solid', 'dense', 'loose', 'tight', 'quiet', 'score', 'skill',
    // ← moved from your `five` that are actually 5 letters
    'speed', 'focus', 'mount', 'board', 'sound', 'write', 'words',
    'cable', 'rapid', 'local', 'bring', 'begin', 'offer', 'place',
    'power', 'value',
  ],
  six: [
    'switch', 'finger', 'change', 'action', 'signal', 'screen',
    'layout', 'linear', 'clicky', 'smooth', 'people', 'appear',
    'happen', 'window', 'global', 'static', 'active',
  ],
  seven: [
    'testing', 'typing', 'letters', 'keycap', 'tactile',
    'connect', 'monitor', 'display', 'company', 'produce',
    'provide', 'require', 'request', 'convert', 'support', 'process',
  ],
  eight: [
    'keyboard', 'practice', 'response', 'feedback', 'reliable',
    'consider', 'remember', 'accurate', 'function', 'stabilizer',
  ],
  nine: [
    'precision', 'challenge', 'sentences', 'efficient',
    'animation', 'component', 'interface', 'formatter',
  ],
  ten: [
    'satisfying', 'leaderboard', 'consistent', 'competition',
    'responsive', 'accessible', 'compressed', 'transition',
    'fullscreen', 'stylesheet', 'typescript', 'javascript',
    'middleware', 'controller', 'pagination', 'validation',
    'screenshot', 'background', 'improvement', 'alternative',
  ],
};

// Define your difficulty anchors — add as many as you want
const difficultyAnchors = [
  // Early levels — short, common words dominate
  { level: 1,  dist: { one: 0.20, two: 0.30, three: 0.30, four: 0.15, five: 0.05, six: 0.00, seven: 0.00, eight: 0.00, nine: 0.00, ten: 0.00 } },
  { level: 5,  dist: { one: 0.10, two: 0.20, three: 0.30, four: 0.25, five: 0.10, six: 0.05, seven: 0.00, eight: 0.00, nine: 0.00, ten: 0.00 } },
  { level: 10, dist: { one: 0.05, two: 0.10, three: 0.20, four: 0.30, five: 0.20, six: 0.10, seven: 0.05, eight: 0.00, nine: 0.00, ten: 0.00 } },

  // Mid levels — medium words take over, long words introduced
  { level: 15, dist: { one: 0.00, two: 0.05, three: 0.15, four: 0.25, five: 0.25, six: 0.15, seven: 0.10, eight: 0.05, nine: 0.00, ten: 0.00 } },
  { level: 20, dist: { one: 0.00, two: 0.05, three: 0.10, four: 0.20, five: 0.25, six: 0.20, seven: 0.10, eight: 0.05, nine: 0.05, ten: 0.00 } },
  { level: 25, dist: { one: 0.00, two: 0.00, three: 0.10, four: 0.15, five: 0.20, six: 0.20, seven: 0.15, eight: 0.10, nine: 0.05, ten: 0.05 } },

  // Upper levels — long and complex words dominate
  { level: 30, dist: { one: 0.00, two: 0.00, three: 0.05, four: 0.10, five: 0.15, six: 0.20, seven: 0.20, eight: 0.15, nine: 0.10, ten: 0.05 } },
  { level: 35, dist: { one: 0.00, two: 0.00, three: 0.05, four: 0.05, five: 0.10, six: 0.15, seven: 0.20, eight: 0.20, nine: 0.15, ten: 0.10 } },
  { level: 40, dist: { one: 0.00, two: 0.00, three: 0.00, four: 0.05, five: 0.10, six: 0.15, seven: 0.20, eight: 0.20, nine: 0.15, ten: 0.15 } },
  { level: 45, dist: { one: 0.00, two: 0.00, three: 0.00, four: 0.05, five: 0.05, six: 0.10, seven: 0.15, eight: 0.25, nine: 0.20, ten: 0.20 } },

  // Level 50 — elite, only long words
  { level: 50, dist: { one: 0.00, two: 0.00, three: 0.00, four: 0.00, five: 0.05, six: 0.05, seven: 0.10, eight: 0.20, nine: 0.30, ten: 0.30 } },
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

export const generateWords = async (count = 50) => {
  const { user } = await chrome.storage.local.get(["user"]);
  const level = user?.stats?.level?.level || 1

  const distribution = getDistribution(level);

  const pick = (arr, n) =>
    n <= 0 ? [] : [...arr].sort(() => Math.random() - 0.5).slice(0, n);

  const counts = {
    one:   Math.round(count * distribution.one),
    two:   Math.round(count * distribution.two),
    three: Math.round(count * distribution.three),
    four:  Math.round(count * distribution.four),
    five:  Math.round(count * distribution.five),
    six:   Math.round(count * distribution.six),
    seven: Math.round(count * distribution.seven),
    eight: Math.round(count * distribution.eight),
    nine:  Math.round(count * distribution.nine),
    ten:   Math.round(count * distribution.ten),
  };

  // Fix rounding drift
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  counts.four += count - total;

  const words = [
    ...pick(commonWords.one,   counts.one),
    ...pick(commonWords.two,   counts.two),
    ...pick(commonWords.three, counts.three),
    ...pick(commonWords.four,  counts.four),
    ...pick(commonWords.five,  counts.five),
    ...pick(commonWords.six,  counts.six),
    ...pick(commonWords.seven,  counts.seven),
    ...pick(commonWords.eight,  counts.eight),
    ...pick(commonWords.nine,  counts.nine),
    ...pick(commonWords.ten,  counts.ten),
  ].sort(() => Math.random() - 0.5);

  return words.map((word, i) => ({ word, key: `${Date.now()}-${i}` }));
};