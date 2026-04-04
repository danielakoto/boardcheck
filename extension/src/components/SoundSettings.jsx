import React, { useState } from 'react'
import { FaTimes, FaVolumeDown } from "react-icons/fa";

import { SoundSelector } from './SoundSelector'

export const SoundSettings = ({ colors, sound, updateSound, sounds }) => {
  const [open, setOpen] = useState(false)

  return (
      <>
         {/* Toggle button */}
         <div
            onClick={() => setOpen(o => !o)}
            style={{
               background: open ? colors.keyBg : 'var(--bg)',
               color: open ? colors.keyText : 'var(--text)',
               borderRadius: '5px',
               padding: '4px',
               cursor: 'pointer',
               fontSize: '18px',
               transition: 'background 0.3s ease, color 0.3s ease',
               writingMode: 'vertical-rl',
               letterSpacing: '2px',
               // boxShadow: open ? 'none' : 'var(--box-shadow)'
               height: '25px',
               width: '25px',
               display: 'flex',
               alignItems: 'center',
               justifyContent: 'center'
            }}
         >
            <FaVolumeDown />
         </div>

         <div onClick={() => setOpen(o => !o)} 
            style={{ 
               width:'100vw', 
               height:'100%', 
               padding:'12px',
               position: 'fixed',
               top:'0px',
               left: open ? '0px' : '-100vw',
               zIndex: 999,
               transition: 'left 0.3s ease',
               boxSizing: 'border-box',
               display:'flex',
               alignItems:'end',
               justifyContent:'start'
            }}
         >
            <div onClick={(e) => e.stopPropagation()}
            style={{
               position: 'fixed',
               width: '250px',
               height: '273px',
               background: 'var(--overlay-bg)',
               backdropFilter: 'blur(5px)',
               color: 'var(--text)',
               padding: '8px',
               display: 'flex',
               flexDirection: 'column',
               gap: '2x',
               borderRadius: '5px',
               boxShadow: 'var(--box-shadow)',
            }}>
               <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',  width: '100%' }}>
                  <h3 style={{ margin: 0, fontSize: '13px', letterSpacing: '2px', textTransform: 'uppercase', opacity: 0.6 }}>
                     Sounds
                  </h3>
                  <FaTimes onClick={() => setOpen(o => !o)} className='icon-button' />
               </div>
               <SoundSelector colors={colors} sound={sound} updateSound={updateSound} sounds={sounds} />
            </div>
         </div>
      </>
   )
}