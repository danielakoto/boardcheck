import React, { useEffect, useState, useRef, useCallback } from 'react'
import { FaTimes } from "react-icons/fa";

import './Typing.scss';

const commonWords = [
  'the', 'quick', 'brown', 'fox', 'jumps', 'over', 'lazy', 'dog',
  'keyboard', 'testing', 'speed', 'typing', 'challenge', 'practice',
  'accuracy', 'focus', 'rhythm', 'precision', 'smooth', 'flow',
  'letters', 'words', 'sentences', 'write', 'switch',
  'keycap', 'stabilizer', 'mount', 'layout', 'custom', 'board',
  'cherry', 'gateron', 'tactile', 'linear', 'clicky',
  'sound', 'feel', 'response', 'feedback', 'satisfying', 'perfect',
  'test', 'type', 'race', 'competition', 'leaderboard', 'score',
  'rank', 'skill', 'improvement', 'consistent', 'reliable', 'efficient',
  'time', 'year', 'people', 'hand', 'place', 'case', 'week', 'company',
  'question', 'work', 'part', 'play', 'move', 'live', 'hold', 'bring',
  'show', 'begin', 'keep', 'give', 'read', 'allow', 'add', 'spend',
  'grow', 'open', 'walk', 'win', 'offer', 'remember', 'love', 'consider',
  'appear', 'produce', 'happen', 'window', 'finger', 'power', 'change',
  'action', 'value', 'signal','cable', 'plug', 'port', 'connect', 'monitor',
  'screen', 'display', 'panel', 'frame', 'pixel', 'rapid', 'sharp', 'clean',
  'clear', 'light', 'dark', 'bold', 'soft', 'quiet', 'heavy', 'solid',
  'dense', 'loose', 'tight', 'warm', 'cool', 'active', 'static', 'global', 'local',
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
   const typingWordStatusRef = useRef([]); // add this
   const [words, setWords] = useState(() => generateWords(60));
   // Snapshot of completed test results for the modal
   const [testResults, setTestResults] = useState({
      wpm: 0,
      accuracy: 0,
      correctWords: 0,
      incorrectWords: 0,
      timeElapsed: 0,
      totalWords: 0
   });

   const wordRefs = useRef([]);
   const containerRef = useRef(null);

   // Auto-scroll active word into view
   useEffect(() => {
      const activeEl = wordRefs.current[wordIndex];
      if (activeEl && containerRef.current) {
         const container = containerRef.current;
         const elTop = activeEl.offsetTop;
         const elHeight = activeEl.offsetHeight;
         container.scrollTop = elTop - elHeight * 2;
      }
   }, [wordIndex]);

   // Append more words when running low
   useEffect(() => {
      if (words.length - wordIndex < 8) {
         setWords(prev => [...prev, ...generateWords(10)]);
      }
   }, [wordIndex, words.length]);

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
            const newTypingWordSatus = [...typingWordStatus, {
               correct: isCorrect,
               word: currentWord,
               typed,
               key: words[wordIndex].key
            }]
            setTypingWordStatus(newTypingWordSatus);
            typingWordStatusRef.current = newTypingWordSatus;
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
      setTyped("");
      setTimeElapsed(0);
      setWordIndex(0);
      setTypingWordStatus([]);
      typingWordStatusRef.current = [];
      setTestResults({
         wpm: 0,
         accuracy: 0,
         correctWords: 0,
         incorrectWords: 0,
         timeElapsed: 0,
         totalWords: 0
      });
      // Fresh word set every new test
      setWords(generateWords(10));
   };

   const endTest = useCallback(() => {
      setTypingState('finished');
      const snapshot = typingWordStatusRef.current; // ← always fresh
      const minutes = testDuration / 60

      const results = {
         wpm: Math.round(snapshot.filter(i => i.correct).length / minutes),
         accuracy: snapshot.length === 0 ? 100 : Math.round((snapshot.filter(i => i.correct).length / snapshot.length) * 100),
         correctWords: snapshot.filter(i => i.correct).length,
         incorrectWords: snapshot.filter(i => !i.correct).length,
         timeElapsed,
         totalWords: snapshot.length
      };

      setTestResults(results);
      if (onTestComplete) onTestComplete(results);
   }, [timeElapsed, onTestComplete, setTypingState]);

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
      if (typingState === "idle") startTest();
      if (typingState === "running") setTypingState("idle");
      if (typingState === "finished") startTest();
   };

   // Grade label based on WPM
   const getGrade = (wpm) => {
      if (wpm >= 180) return { label: 'Transcendent', color: '#ff6fff' };
      if (wpm >= 140) return { label: 'Legendary',    color: '#ffd700' };
      if (wpm >= 110) return { label: 'Elite',         color: '#f07612' };
      if (wpm >= 85)  return { label: 'Advanced',      color: '#60d890' };
      if (wpm >= 65)  return { label: 'Proficient',    color: '#60b4f0' };
      if (wpm >= 45)  return { label: 'Average',       color: '#a0c8ff' };
      if (wpm >= 25)  return { label: 'Beginner',      color: '#f0c060' };
      return { label: 'Keep Practicing', color: '#f07060' };
   };

   return (
      <div id='typing-section'>
         <button
            onClick={handleWPMTestButton}
            style={{
               background: typingState === "running" ? colors.keyBg : 'var(--bg)',
               color: typingState === "running" ? colors.keyText : 'var(--text)',
               borderRadius: '5px',
               cursor: 'pointer',
               transition: 'background 0.3s ease',
               letterSpacing: '2px',
            }}
         >
            {typingState === "running" ? "Stop WPM Test" : "Start WPM Test"}
         </button>
         <div style={{ 
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width:'100%', 
            height:'fit-content', 
            padding:'12px',
            position: 'fixed',
            bottom: typingState === "finished" ? '0px' : '-290px',
            left: '0px',
            zIndex: 999,
            transition: 'bottom 0.3s ease',
            boxSizing: 'border-box'
         }}>
            <div id='typing-results' className="results-modal" style={{
               width: '725px',
               height: 'fit-content',
               color: 'var(--text)',
               flexDirection: 'column',
               borderRadius: '5px',
               boxShadow: 'var(--box-shadow)',
               display: 'flex',
               alignItems: 'center',
               justifyContent: 'center',
               gap: '12px',
               padding: '16px',
               boxSizing: 'border-box',
            }}>
               {/* Header row */}
               <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                  <h3 style={{ margin: 0, fontSize: '13px', letterSpacing: '2px', textTransform: 'uppercase', opacity: 0.6 }}>
                     Test Complete
                  </h3>
                  <FaTimes onClick={() => setTypingState("idle")} className='icon-button' />
               </div>

               {/* Grade badge */}
               {(() => {
               const grade = getGrade(testResults.wpm);
                  return (
                     <div style={{
                        fontSize: '11px',
                        letterSpacing: '3px',
                        textTransform: 'uppercase',
                        fontWeight: 700,
                        color: grade.color,
                        border: `1px solid ${grade.color}`,
                        borderRadius: '4px',
                        padding: '3px 10px',
                     }}>
                        {grade.label}
                     </div>
                  );
               })()}

               {/* Big WPM number */}
               <div style={{ textAlign: 'center', lineHeight: 1 }}>
                  <div style={{
                     fontSize: '56px',
                     fontWeight: 800,
                     color: colors.keyBg,
                     letterSpacing: '-2px',
                  }}>
                     {testResults.wpm}
                  </div>
                  <div style={{ fontSize: '11px', letterSpacing: '3px', textTransform: 'uppercase', opacity: 0.5, marginTop: '2px' }}>
                     WPM
                  </div>
               </div>

               {/* Stat grid */}
               <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(5, 1fr)',
                  gap: '6px',
                  width: '100%',
               }}>
               {[
                  { label: 'Accuracy', value: `${testResults.accuracy}%` },
                  { label: 'Correct',  value: testResults.correctWords },
                  { label: 'Incorrect', value: testResults.incorrectWords },
                  { label: 'Time',     value: formatTime(testDuration) },
                  ].map(({ label, value }) => (
                     <div key={label} className="stat-card" style={{ textAlign: 'center' }}>
                        <div className="stat-label">{label}</div>
                        <div className="stat-value">{value}</div>
                     </div>
                  ))}
                  <button
                     onClick={startTest}
                     style={{
                        background: colors.keyBg,
                        color: colors.keyText,
                        border: 'none',
                        borderRadius: '5px',
                        padding: '7px 24px',
                        fontSize: '12px',
                        letterSpacing: '2px',
                        textTransform: 'uppercase',
                        fontWeight: 700,
                        cursor: 'pointer',
                        transition: 'opacity 0.2s',
                     }}
                     onMouseEnter={e => e.target.style.opacity = '0.8'}
                     onMouseLeave={e => e.target.style.opacity = '1'}
                  >
                     Try Again
                  </button>
               </div>
            </div>
         </div>
         <div style={{ 
               display: 'flex',
               alignItems: 'center',
               justifyContent: 'center',
               width:'100%', 
               height:'fit-content', 
               padding:'12px',
               position: 'fixed',
               bottom: typingState === "running" ? '0px' : '-290px',
               left: '0px',
               zIndex: 999,
               transition: 'bottom 0.3s ease',
               boxSizing: 'border-box'
            }}>
            <div id='typing'
               style={{
                  width: '709px',
                  height: 'fit-content',
                  color: 'var(--text)',
                  padding: '8px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '2px',
                  borderRadius: '5px',
                  boxShadow: 'var(--box-shadow)'
               }}>

               {/* ── Normal typing UI ── */}
               <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                  <h3 style={{ margin: 0, fontSize: '13px', letterSpacing: '2px', textTransform: 'uppercase', opacity: 0.6 }}>
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
      </div>
   );
};