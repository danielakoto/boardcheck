import { FaLink } from "react-icons/fa6";

import "../styles/SoundSelector.scss"

export function SoundSelector({ colors, sound, updateSound, sounds }) {

   let user = JSON.parse(localStorage.getItem("user"))

   const handleBuyBoard = (s) => {
      s.urls.forEach(url => {
         window.open(url, '_blank')
      });
   }

   return (
      <div id="sound-selector">
         {sounds.map(s => (
            <div key={s.id} onClick={() => {updateSound(s)}} className="sound-choice"
               style={{
                  backgroundColor: sound.id === s.id ? colors.keyBg : 'transparent',
                  color: sound.id === s.id ? colors.keyText : 'var(--text)'
               }}
            >
               <div className="sound-title">
                  <h4>{s.name}</h4>
                  {(user?.stats?.level?.level < s?.level || (s?.level > 1 && !user.email)) && (<p>Unlocks at Level {s.level}</p>)}
               </div>
               <p>{s.description}</p>
               
               <div className="urls">
                  <p>{s.category}</p>
                  {(s.urls.length > 0) ? <div onClick={() => { handleBuyBoard(s) }}>Buy Board - {s.urls.length} URLs</div> : null}
               </div>
            </div>
            ))
         }
      </div>
   )
}