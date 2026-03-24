
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

// Preset modes you can offer users
const modes = {
  easy:   { one: 0.10, two: 0.20, three: 0.40, four: 0.25, long: 0.05 },
  normal: { one: 0.05, two: 0.10, three: 0.35, four: 0.35, long: 0.15 },
  hard:   { one: 0.00, two: 0.05, three: 0.15, four: 0.35, long: 0.45 },
};

// Now generateWords has full distribution control
export const generateWords = (count = 50, distribution = modes.easy) => {
  const pick = (arr, n) => [...arr].sort(() => Math.random() - 0.5).slice(0, n);

  const counts = {
    one:   Math.round(count * distribution.one),
    two:   Math.round(count * distribution.two),
    three: Math.round(count * distribution.three),
    four:  Math.round(count * distribution.four),
    long:  Math.round(count * distribution.long),
  };

  const words = [
    ...pick(commonWords.one,   counts.one),
    ...pick(commonWords.two,   counts.two),
    ...pick(commonWords.three, counts.three),
    ...pick(commonWords.four,  counts.four),
    ...pick(commonWords.long,  counts.long),
  ].sort(() => Math.random() - 0.5);

  return words.map((word, i) => ({ word, key: `${Date.now()}-${i}` }));
};