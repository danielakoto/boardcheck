import React, { useEffect, useState, useRef, useCallback } from 'react'
import { FaTimes } from "react-icons/fa";

import './Typing.scss';

const commonWords = [
  'the', 'quick', 'brown', 'fox', 'jumps', 'over', 'lazy', 'dog',
  'keyboard', 'testing', 'speed', 'typing', 'challenge', 'practice',
  'accuracy', 'focus', 'rhythm', 'precision', 'smooth', 'flow',
  'letters', 'words', 'sentences', 'code', 'write', 'develop',
  'create', 'build', 'design', 'function', 'mechanic', 'switch',
  'keycap', 'stabilizer', 'mount', 'layout', 'custom', 'board',
  'cherry', 'gateron', 'tactile', 'linear', 'clicky',
  'sound', 'feel', 'response', 'feedback', 'satisfying', 'perfect',
  'test', 'type', 'race', 'competition', 'leaderboard', 'score',
  'rank', 'skill', 'improvement', 'consistent', 'reliable', 'efficient'
];

const generateWords = (count = 20) => {
  const shuffled = [...commonWords].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count).map((word, i) => ({ word, key: `${Date.now()}-${i}` }));
};

export const Typing = ({ colors, onTestComplete, typingState, setTypingState }) => {
  const [typed, setTyped] = useState("");
  const [timeElapsed, setTimeElapsed] = useState(0);
  const timerRef = useRef(null);
  const testDuration = 60;

  const [wordIndex, setWordIndex] = useState(0);
  const [typingWordStatus, setTypingWordStatus] = useState([]);
  const [words, setWords] = useState(() => generateWords(10));

  const wordRefs = useRef([]);
  const containerRef = useRef(null);

  // Auto-scroll active word into view
  useEffect(() => {
    const activeEl = wordRefs.current[wordIndex];
    if (activeEl && containerRef.current) {
      const container = containerRef.current;
      const elTop = activeEl.offsetTop;
      const elHeight = activeEl.offsetHeight;
      // Scroll so active word is near the top
      container.scrollTop = elTop - elHeight * 2;
    }
  }, [wordIndex]);

  // Append more words when running low
  useEffect(() => {
    if (words.length - wordIndex < 8) {
      setWords(prev => [...prev, ...generateWords(10)]);
    }
  }, [wordIndex, words.length]);

   // Replace the pressed useEffect with this
   useEffect(() => {
      if (typingState !== 'running') return;

      const handleKeyDown = (e) => {
         e.preventDefault();
         
         const key = e.key;

         if (key === 'Backspace') {
            setTyped(t => t.slice(0, -1));
         } else if (key === ' ') {
            const currentWord = words[wordIndex]?.word ?? '';
            const isCorrect = typed === currentWord;

            setTypingWordStatus(w => [...w, {
               correct: isCorrect,
               word: currentWord,
               typed,
               key: words[wordIndex].key
            }]);
            setTyped("");
            setWordIndex(prev => prev + 1);
         } else if (key.length === 1) {
            // key.length === 1 filters out modifier keys (Shift, Control, Alt, etc.)
            setTyped(t => `${t}${key}`);
         }
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
   }, [typingState, words, wordIndex, typed]);

   const startTest = () => {
      setTypingState("running");
      setTyped("")
      setTimeElapsed(0);
      setWordIndex(0);
      setTypingWordStatus([])
   };

   const endTest = useCallback(() => {
      setTypingState('finished');
      const minutes = timeElapsed / 60 || 1 / 60;
      const totalCorrectWords = typingWordStatus.length > 0
         ? typingWordStatus.filter(i => i.correct).length
         : 0;

      if (onTestComplete) {
         onTestComplete({
            wpm: Math.round(totalCorrectWords / minutes),
            accuracy: typingWordStatus.length === 0 ? 100
               : Math.round((typingWordStatus.filter(i => i.correct).length / typingWordStatus.length) * 100),
            correctWords: typingWordStatus.filter(i => i.correct).length,
            incorrectWords: typingWordStatus.filter(i => !i.correct).length,
            timeElapsed,
            totalWords: typingWordStatus.length
         });
      }
   }, [timeElapsed, typingWordStatus, onTestComplete, setTypingState]);

   useEffect(() => {
      if (typingState === 'running') {
         timerRef.current = setInterval(() => {
         setTimeElapsed(prev => {
            const next = prev + 1;
            if (next >= testDuration) {
               clearInterval(timerRef.current);
               endTest();
               return testDuration;
            }
            return next;
         });
         }, 1000);
      }
      return () => clearInterval(timerRef.current);
   }, [typingState]);

   const calculateWPM = () => {
      if (timeElapsed === 0) return 0;
      return Math.round(typingWordStatus.filter(i => i.correct).length / (timeElapsed / 60));
   };

   const calculateAccuracy = () => {
      const total = typingWordStatus.length;
      if (total === 0) return 100;
      return Math.round((typingWordStatus.filter(i => i.correct).length / total) * 100);
   };

   const formatTime = (seconds) => {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
   };

   const progressPercent = (timeElapsed / testDuration) * 100;

   // Render a word with per-character coloring
   const renderWordChars = (word, typedStr, isActive) => {
      return word.split('').map((char, i) => {
         let className = 'char';
         if (isActive) {
         if (i < typedStr.length) {
            className += typedStr[i] === char ? ' char-correct' : ' char-wrong';
         } else {
            className += ' char-pending';
         }
         }
         return <span key={i} className={className}>{char}</span>;
      });
   };

   const handleWPMTestButton = () => {
      if(typingState === "idle") startTest();
      if(typingState === "running") setTypingState("idle")
      if(typingState === "finished") startTest();
   }

   return (
   <div id='typing-section'>
      <button
         onClick={handleWPMTestButton}
         style={{
            background: typingState === "running" || typingState === "finished"  ? colors.keyBg : 'var(--bg)',
            color: typingState === "running" || typingState === "finished"  ? colors.keyText : 'var(--text)',
            borderRadius: '5px',
            cursor: 'pointer',
            transition: 'background 0.3s ease',
            letterSpacing: '2px',
            // boxShadow: open ? 'none' : 'var(--box-shadow)'
         }}
         >
         {typingState === "running" ? "Stop WPM Test" : "Start WPM Test"} 
      </button>
      <div id='typing'
         style={{
         position: 'fixed',
         bottom: typingState === "running" || typingState === "finished" ? '8px' : '-290px',
         left: '12px',
         width: '709px',
         height: 'fit-content',
         color: 'var(--text)',
         padding: '8px',
         zIndex: 999,
         transition: 'bottom 0.3s ease',
         display: 'flex',
         flexDirection: 'column',
         gap: '2x',
         borderRadius: '5px',
         boxShadow: 'var(--box-shadow)'
      }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',  width: '100%' }}>
            <h3 style={{ margin: 0, fontSize: '14px', letterSpacing: '1px', textTransform: 'uppercase' }}>
               Typing
            </h3>
            <FaTimes onClick={() => setTypingState("idle")} className='icon-button' />
         </div>
         {/* Progress Bar */}
         <div className="progress-bar-container">
         <div className="progress-bar-fill" style={{ width: `${progressPercent}%` }} />
         </div>

         {/* Word Display */}
         <div className='words' ref={containerRef}>
            {words.map((wordObj, idx) => {
               const status = typingWordStatus.find(s => s.key === wordObj.key);
               const isActive = idx === wordIndex;
               const isDone = idx < wordIndex;

               let wordClass = 'word';
               if (isActive) wordClass += ' word-active';
               if (isDone) wordClass += status?.correct ? ' word-done-correct' : ' word-done-wrong';

               return (
               <div
                  key={wordObj.key}
                  className={wordClass}
                  ref={el => wordRefs.current[idx] = el}
               >
                  {isActive
                     ? renderWordChars(wordObj.word, typed, true)
                     : isDone
                     ? renderWordChars(wordObj.word, status?.typed ?? '', false)
                     : <span className="char char-pending">{wordObj.word}</span>
                  }
                  {/* Show typed chars that overflow the word length as errors */}
                  {isActive && typed.length > wordObj.word.length && (
                     <span className="char char-wrong">
                     {typed.slice(wordObj.word.length)}
                     </span>
                  )}
               </div>
               );
            })}
         </div>

         {/* Stats Bar */}
         <div className="stats-bar">
            <div className="stat-card">
               <div className="stat-label">Time</div>
               <div className="stat-value">{formatTime(timeElapsed)}</div>
            </div>
            <div className="stat-card">
               <div className="stat-label">WPM</div>
               <div className="stat-value">{calculateWPM()}</div>
            </div>
            <div className="stat-card">
               <div className="stat-label">Accuracy</div>
               <div className="stat-value">{calculateAccuracy()}%</div>
            </div>
            <div className="stat-card">
               <div className="stat-label">Words</div>
               <div className="stat-value">{typingWordStatus.length}</div>
            </div>
         </div>
      </div>
    </div>
  );
};