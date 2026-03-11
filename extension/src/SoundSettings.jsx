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
               color: 'var(--text)',
               borderRadius: '5px',
               padding: '4px',
               cursor: 'pointer',
               fontSize: '18px',
               transition: 'background 0.3s ease',
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

         {/* Sidebar panel */}
         <div style={{
            position: 'fixed',
            bottom: '11px',
            left: open ? '12px' : '-274px',
            width: '250px',
            height: '273px',
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(5px)',
            color: 'var(--text)',
            padding: '8px',
            zIndex: 999,
            transition: 'left 0.3s ease',
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
      </>
   )
}