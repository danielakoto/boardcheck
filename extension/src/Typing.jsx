import React, { useEffect, useState } from 'react'

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

export const Typing = ({ colors, pressed }) => {
   const [wordIndex, setWordIndex] = useState([])
   const [correctWords, setCorrectWords] = useState([])
   const [wrongWords, setWrongWords] = useState([])
   
   const [words, setWords] = useState([])
   

   useEffect(() => {
      const randomWords = () => {
         let numberOfWords = 12
         let indexList = [] 
         
         while(numberOfWords > 0) {
            numberOfWords--
            indexList.push(Number.parseInt(Math.random() * (62 - 0) + 0))
         }
         console.log(indexList)
         const ws = indexList.map((index, key) => {return { "word": commonWords[index], "key": key}})

         setWords(ws)
         setCurrentWord(ws[0])
      }
      randomWords()
   }, [])

   useEffect(() => {
      
   }, [pressed])
   
   console.log(pressed)

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
         {words.map((word) => <div key={word.key}>
            {word.word}
         </div>)}
      </div>
   )
}
