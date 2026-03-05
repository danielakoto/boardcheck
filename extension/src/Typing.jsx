import React, { useEffect, useState, useRef } from 'react'
import toast from 'react-hot-toast';

import './Typing.scss';

const commonWords = [
  'the', 'quick', 'brown', 'fox', 'jumps', 'over', 'lazy', 'dog',
  'keyboard', 'testing', 'speed', 'typing', 'challenge', 'practice',
  'accuracy', 'focus', 'rhythm', 'precision', 'smooth', 'flow',
  'letters', 'words', 'sentences', 'code', 'write', 'develop',
  'create', 'build', 'design', 'function', 'mechanic', 'switch',
  'keycap', 'stabilizer', 'mount', 'layout', 'custom', 'board',
  'cherry', 'gateron', 'switch', 'tactile', 'linear', 'clicky',
  'sound', 'feel', 'response', 'feedback', 'satisfying', 'perfect',
  'test', 'type', 'race', 'competition', 'leaderboard', 'score',
  'rank', 'skill', 'improvement', 'consistent', 'reliable', 'efficient'
];

export const Typing = ({ colors, pressed, onTestComplete, typingState, setTypingState}) => {
   // const [] = useState("idle")
   const [typed, setTyped] = useState("")
   const [timeElapsed, setTimeElapsed] = useState(0)
   const [testDuration, setTestDuration] = useState(60);
   const timerRef = useRef(null);
   
   const [wordIndex, setWordIndex] = useState(0)
   const [typingWordStatus, setTypingWordStatus] = useState([])
   
   const [words, setWords] = useState([])

   useEffect(() => {
      const randomWords = () => {
         let numberOfWords = 12
         let indexList = [] 
         
         while(numberOfWords > 0) {
            numberOfWords--
            let randomNum = Number.parseInt(Math.random() * (62 - 0) + 0)
            while (indexList.includes(randomNum)) {
               randomNum = Number.parseInt(Math.random() * (62 - 0) + 0)
            }
            indexList.push(randomNum)
         }
         const ws = indexList.map((index, key) => {return { "word": commonWords[index], "key": key}})

         setWords(ws)
         // setWordIndex(ws[0])
      }
      if(words.length === 0)
         randomWords()
   }, [words])

   useEffect(() => {
      const keyPressed = () => {
         if(pressed === null) return;
         // if(invalidKey()) retrun; 
         if (pressed === "backspace") {
            setTyped(t => t.slice(0, -1))
         } else if (pressed === "space") {
            if(typed == [words[wordIndex].word]){
               console.log("The word is valid and they are equal")
               setTyped("")
               setWordIndex(prev => prev + 1)
               setTypingWordStatus(w => [...w, { correct: true, word: [words[wordIndex].word], typed: typed, key: words[wordIndex].key }])
            } else {
               setTyped("")
               console.log("Error in word")
               toast.error("Wrong")
               setWordIndex(prev => prev + 1)
               setTypingWordStatus(w => [...w, { correct: false, word: [words[wordIndex].word], typed: typed, key: words[wordIndex].key }])
            }
         } else {
            console.log(pressed)
            console.log(typed)
            console.log(words[wordIndex].word)
            console.log(`${typed}${pressed}`)
            setTyped(t => `${t}${pressed}`)
         }

      }
      if(typingState === "running")
         keyPressed()
   }, [pressed])

   // const reset = () => {
   //    setTypingState('idle');
   //    setTyped("")
   //    setWordIndex(0)
   //    setWords([])
   //    setTypingWordStatus([])
   // }
   
   const startTest = () => {
      // setTypingState('running');
      setTyped("")
      setTimeElapsed(0);
      setWordIndex(0);
      setTypingWordStatus([])
   };

   const endTest = () => {
      setTypingState('finished');
      // Call callback with results
      if (onTestComplete) {
         onTestComplete({
            wpm: calculateWPM(),
            accuracy: calculateAccuracy(),
            correctWords: typingWordStatus.filter(item => item.correct === true).length,
            incorrectWords: typingWordStatus.filter(item => item.correct === false).length,
            timeElapsed,
            totalWords: typingWordStatus.length
         });
      }
   };

   // Calculate WPM
   const calculateWPM = () => {
      if (timeElapsed === 0) return 0;
      const minutes = timeElapsed / 60;
      const totalWords = typingWordStatus.length;
      const wpm = Math.round(totalWords / minutes);
      return wpm;
   };

   // Calculate accuracy
   const calculateAccuracy = () => {
      const total = typingWordStatus.length;
      if (total === 0) return 100;
      return Math.round((typingWordStatus.filter(item => item.correct === true).length / total) * 100);
   };

   const formatTime = (seconds) => {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
   };

   // Timer logic
   useEffect(() => {
      if (typingState === 'running') {
         timerRef.current = setInterval(() => {
         setTimeElapsed(prev => {
            const newTime = prev + 1;
            if (newTime >= testDuration) {
               endTest();
               return testDuration;
            }
            return newTime;
         });
         }, 1000);
      }
      return () => {
         if (timerRef.current) clearInterval(timerRef.current);
      };
   }, [typingState, testDuration]);

   const progressPercent = testDuration > 0 ? (timeElapsed / testDuration) * 100 : 0;
   
   return (
      <div id='typing'
         style={{
            '--board-bg':             colors.boardBg,
            '--key-bg':               colors.keyBg,
            '--key-shadow':           colors.keyShadow,
            '--key-text':             colors.keyText,
            '--active-highlight':     colors.activeHighlight,
            '--clicked-key-bg':       colors.clickedKeyBg,
            '--clicked-key-text':     colors.clickedKeyText,
         }}
      >
         
         {/* Progress Bar */}
         <div className="progress-bar-container">
            <div className="progress-bar-fill" style={{ width: `${progressPercent}%` }}></div>
         </div>
         {/* Stats Bar */}
         {typingState === 'running' && (
            <div className="stats-bar">
               <div className="stat-card">
                  <div className="stat-label">Time</div>
                  <div className="stat-value">{formatTime(timeElapsed)}</div>
               </div>
               <div className="stat-card">
                  <div className="stat-label">WPM</div>
                  <div className="stat-value">{typingState !== 'idle' ? calculateWPM() : '--'}</div>
               </div>
               <div className="stat-card">
                  <div className="stat-label">Accuracy</div>
                  <div className="stat-value">{typingState !== 'idle' ? calculateAccuracy() : '--'}%</div>
               </div>
               <div className="stat-card">
                  <div className="stat-label">Words</div>
                  <div className="stat-value">{typingWordStatus.length}</div>
               </div>
            </div>
         )}

         {typingState === 'running' && (
            <div className='words'>
               {words.map((word) => <div key={word.key}>
                  {word.word}
               </div>)}
            </div>
         )}
         {(typingWordStatus.length > 0) && (
            <div className='words'>
               {typingWordStatus.map((typedWord) => 
                  (typedWord.correct) 
                  ?  <div className='correct-word' key={typedWord.key}>
                        {typedWord.word}
                     </div>
                  :  <div className='wrong-word' key={typedWord.key}>
                        {typedWord.typed}
                     </div>
               )}
            </div>
         )}
      </div>
   )
}
