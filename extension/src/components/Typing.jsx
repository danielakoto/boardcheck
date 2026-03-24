import React, { useEffect, useState, useRef, useCallback } from 'react'
import { FaTimes } from "react-icons/fa";

import { getRank } from '../functions/useLevels.js';
import { generateWords } from '../functions/useWords.js';

import '../styles/Typing.scss';

export const Typing = ({ user, colors, onTestComplete, typingState, setTypingState }) => {
   const [typed, setTyped] = useState("");
   const [timeElapsed, setTimeElapsed] = useState(0);
   const timerRef = useRef(null);
   const testDuration = 30;

   const [wordIndex, setWordIndex] = useState(0);
   const [typingWordStatus, setTypingWordStatus] = useState([]);
   const typingWordStatusRef = useRef([]); // add this
   const [words, setWords] = useState(() => generateWords(50));
   // Snapshot of completed test results for the modal
   const [testResults, setTestResults] = useState({
      wpm: 0,
      accuracy: 0,
      correctWords: 0,
      incorrectWords: 0,
      timeElapsed: 0,
      totalWords: 0,
      level: 0
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
      if (typingState !== 'running' && typingState !== 'ready') return;

      const handleKeyDown = (e) => {
         e.preventDefault();

         // First keypress while ready → start the timer
         if (typingState === 'ready') {
            const key = e.key;
            if (key.length === 1 || key === 'Backspace') {
            setTypingState('running');
            // Still process the keystroke immediately
            if (key.length === 1) setTyped(key);
            }
            return;
         }

         // Normal running logic (unchanged)
         const key = e.key;
         if (key === 'Backspace') {
            setTyped(t => t.slice(0, -1));
         } else if (key === ' ') {
            const currentWord = words[wordIndex]?.word ?? '';
            const isCorrect = typed === currentWord;
            const newTypingWordStatus = [...typingWordStatus, {
            correct: isCorrect,
            word: currentWord,
            typed,
            key: words[wordIndex].key
            }];
            setTypingWordStatus(newTypingWordStatus);
            typingWordStatusRef.current = newTypingWordStatus;
            setTyped("");
            setWordIndex(prev => prev + 1);
         } else if (key.length === 1) {
            setTyped(t => `${t}${key}`);
         }
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
   }, [typingState, words, wordIndex, typed]);

   const startTest = useCallback(() => {
      setTypingState("ready");
      setTyped("");
      setTimeElapsed(0);
      setWordIndex(0);
      setTypingWordStatus([]);
      typingWordStatusRef.current = [];
      setTestResults({
         wpm: 0, accuracy: 0, correctWords: 0,
         incorrectWords: 0, timeElapsed: 0, totalWords: 0
      });
      setWords(generateWords(50));
   }, [setTypingState]);

   const endTest = useCallback( async () => {
      const snapshot = typingWordStatusRef.current;
      const minutes = testDuration / 60;
      const wpm = Math.round(snapshot.filter(i => i.correct).length / minutes);

      const results = {
         wpm,
         accuracy: snapshot.length === 0 ? 100 : Math.round((snapshot.filter(i => i.correct).length / snapshot.length) * 100),
         correctWords: snapshot.filter(i => i.correct).length,
         incorrectWords: snapshot.filter(i => !i.correct).length,
         timeElapsed,
         totalWords: snapshot.length,
      };

      setTestResults(results);
      if (onTestComplete) {
         await onTestComplete(results);
         setTypingState('finished');
      }

      setTestResults(results);
      if (onTestComplete) onTestComplete(results);
   }, [timeElapsed, onTestComplete, setTypingState, user]);

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


   // Quick-start: Shift + Enter → begin a new test session
   useEffect(() => {
      const handleQuickStart = (e) => {
         if (e.shiftKey && e.key === 'Enter') {
            e.preventDefault();
            startTest();
         }
      };

      window.addEventListener('keydown', handleQuickStart);
      return () => window.removeEventListener('keydown', handleQuickStart);
   }, []); // ← empty deps, startTest is stable enough here

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
         return (
            <span key={i} className={className}>
            {/* Cursor sits just before the next character to type */}
            {isActive && i === typedStr.length && (
               <span className="typing-cursor" />
            )}
            {char}
            </span>
         );
      });
   };

   const handleWPMTestButton = () => {
      if (typingState === "idle") startTest();
      if (typingState === "ready") setTypingState("idle");
      if (typingState === "running") setTypingState("idle");
      if (typingState === "finished") startTest();
   };

   return (
      <div id='typing-section'>
         <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', position:'relative' }}>
            <div
               className='button'
               onClick={handleWPMTestButton}
               style={{
                  background: (typingState === "running" || typingState === "ready") ? colors.keyBg : 'var(--bg)',
                  color: (typingState === "running" || typingState === "ready") ? colors.keyText : 'var(--text)',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  transition: 'background 0.3s ease',
                  letterSpacing: '2px'
               }}
            >
               {(typingState === "running" || typingState === "ready") ? "Stop WPM Test" : "Start WPM Test"}
            </div>

            {/* Quick-start hint — only show when idle or finished */}
            {(typingState !== "running" && typingState !== "ready") && (
               <div style={{
                  position:'absolute',
                  top:'25px',
                  left:'-10px',
                  fontSize: '10px',
                  letterSpacing: '1.5px',
                  textTransform: 'uppercase',
                  width:'150px',
                  opacity: 0.35,
               }}>
                  or press <kbd style={{ fontFamily: 'inherit' }}>Shift</kbd> + <kbd style={{ fontFamily: 'inherit' }}>Enter</kbd>
               </div>
            )}
         </div>
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
               width: '1000px',
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
                     Score
                  </h3>
                  <FaTimes onClick={() => setTypingState("idle")} className='icon-button' />
               </div>

               {!user?.email && (
                  <div>Please sign in or register to save score.</div>
               )}

               <div style={{ 
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '6px',
                  width: '100%',}}>
                  {/* Big WPM number */}
                  <div style={{ textAlign: 'center', lineHeight: 1 }}>
                     <div style={{
                        fontSize: '56px',
                        fontWeight: 800,
                        // color: colors.keyText,
                        letterSpacing: '-2px',
                        // webkitTextStroke: `2px ${colors.keyBg}`
                     }}>
                        {testResults.wpm}
                     </div>
                     <div style={{ fontSize: '11px', letterSpacing: '3px', textTransform: 'uppercase', opacity: 0.5, marginTop: '2px' }}>
                        WPM
                     </div>
                  </div>
                  <div style={{display:'flex', alignItems:'center', justifyContent:'center'}}>
                  {/* Grade badge */}
                  {(() => {
                     const grade = getRank(testResults.wpm);
                        return (
                           <div style={{
                              fontSize: '25px',
                              letterSpacing: '3px',
                              textTransform: 'uppercase',
                              fontWeight: 700,
                              color: grade.color,
                              border: `2px solid ${grade.color}`,
                              borderRadius: '4px',
                              padding: '3px 10px',
                              width:'fit-content'
                           }}>
                              {grade.label}
                           </div>
                        );
                  })()}
                  </div>
                  {user?.stats && (
                     <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '28px', fontWeight: 800, letterSpacing: '-1px' }}>
                           {user.stats.level.level || 0}
                        </div>
                        <div style={{ fontSize: '11px', letterSpacing: '3px', textTransform: 'uppercase', opacity: 0.5 }}>
                           Level
                        </div>
                        {user.stats.level.next && (
                           <div style={{ fontSize: '10px', letterSpacing: '1.5px', opacity: 0.4, marginTop: '2px' }}>
                              {user.stats.level.next.wordsNeeded?.toLocaleString() || 150} words &amp; {user.stats.level.next.testsNeeded || 10} tests to level {user.stats.level.level + 1 || 0}
                           </div>
                        )}
                     </div>
                  )}
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
                  <div
                     className='button'
                     onClick={startTest}
                     style={{
                        background: colors.keyBg,
                        color: colors.keyText,
                        border: 'none',
                        borderRadius: '5px',
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
                  </div>
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
               bottom: (typingState === "running" || typingState === "ready") ? '0px' : '-290px',
               left: '0px',
               zIndex: 999,
               transition: 'bottom 0.3s ease',
               boxSizing: 'border-box'
            }}>
            <div id='typing'
               style={{
                  width: '1000px',
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
                        {/* Cursor at end when all chars typed but space not yet pressed */}
                        {isActive && typed.length >= wordObj.word.length && (
                           <span className={`typing-cursor${typingState === 'ready' ? ' ready-pulse' : ''}`} />
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
