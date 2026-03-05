import { FaLink } from "react-icons/fa6";

export function SoundSelector({ colors, sound, updateSound, sounds }) {

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
                  backgroundColor: sound.id === s.id ? colors.keyBg : 'var(--bg)',
                  color: sound.id === s.id ? colors.keyText : 'var(--text)'
               }}
            >
               <h4>{s.name}</h4>
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