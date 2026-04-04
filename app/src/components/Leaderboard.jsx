import React, { useState, useEffect } from 'react'
import toast from 'react-hot-toast';
import { FaTimes, FaCrown } from "react-icons/fa";

import { getLeaderboard } from '../background'
import { Loading } from "./index"

import '../styles/Leaderboard.scss'

const RANK_ORDER = [
   "Noob", "Beginner", "Developing", "Average", "Skilled",
   "Proficient", "Advanced", "Elite", "Expert", "Master",
   "Grandmaster", "Legendary", "Mythic", "Transcendent", "Omniscient"
];

export const Leaderboard = ({ user, colors }) => {
   const [loading, setLoading] = useState(false);
   const [open, setOpen] = useState(false)
   const [entries, setEntries] = useState([]);
   const [sortBy, setSortBy] = useState("wpm");

   useEffect(() => {
      const fetchLeaderboard = async () => {
         setLoading(true)
         try {
            setLoading(true);
            const res = await getLeaderboard();
            if (res?.res === "Success") { 
               setEntries(res.data.leaderboard);
            }
            else throw new Error("Failed to fetch leaderboard");
         } catch (err) {
            toast.error(`Error: ${err}`);
         } finally {
            setLoading(false);
         }
      };

      if(open)
         fetchLeaderboard();

   }, [open]);

   const sorted = [...entries].sort((a, b) => {
      if (sortBy === "wpm") return b.wpm - a.wpm;
      if (sortBy === "accuracy") return b.accuracy - a.accuracy;
      if (sortBy === "level") return b.level - a.level;
      if (sortBy === "completed") return b.testsCompleted - a.testsCompleted;
      if (sortBy === "rank") {
         return RANK_ORDER.indexOf(b.earnedRank?.label) - RANK_ORDER.indexOf(a.earnedRank?.label);
      }
      return 0;
   });

   const getMedalColor = (position) => {
      if (position === 1) return "#FFD700";
      if (position === 2) return "#C0C0C0";
      if (position === 3) return "#CD7F32";
      return null;
   };

   const isCurrentUser = (entry) => user && entry.displayName === user.displayName;

   return (
      <div>
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
            <FaCrown />
         </div>

         <div onClick={() => setOpen(o => !o)} style={{ 
            width:'100vw', 
            height:'100vh', 
            padding:'12px',
            position: 'fixed',
            bottom: open ? '0px' : '-100vh',
            left: '0px',
            zIndex: 999,
            transition: 'bottom 0.3s ease, backdrop-filter 0.5s ease 0.3s',
            boxSizing: 'border-box',
            display:'flex',
            alignItems:'center',
            justifyContent:'center',
            backdropFilter: open ? 'blur(3px)' : 'blur(0px)',
         }}>
         <div style={{
            width: '50%',
            minWidth: '1000px',
            height: '50%',
            padding: '16px',
            background: 'var(--bg)',
            backdropFilter: 'blur(5px)',
            color: 'var(--text)',
            display: 'flex',
            borderRadius: '5px',
            boxShadow: 'var(--box-shadow)',
            flexDirection: 'column',
            gap: '4px',
            boxSizing: 'border-box'
         }}
            onClick={(e) => e.stopPropagation()}
         >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',  width: '100%' }}>
               <h3 style={{ margin: 0, fontSize: '13px', letterSpacing: '2px', textTransform: 'uppercase', opacity: 0.6 }}>
               Leaderboard
               </h3>
               <FaTimes onClick={() => setOpen(o => !o)} className='icon-button' />
            </div>
            <div className="leaderboard-container">
                  <div className="leaderboard-header">
                     <p className="leaderboard-subtitle" style={{ margin: 0, fontSize: '13px', letterSpacing: '2px', textTransform: 'uppercase', opacity: 0.6 }}>Top 100</p>
                     {/* Sort controls */}
                     <div className="leaderboard-sort-bar">
                        {[
                           { key: "wpm",      label: "WPM" },
                           { key: "level",    label: "Level" },
                           { key: "accuracy", label: "Accuracy" },
                           { key: "completed",    label: "Completed" },
                           // { key: "rank",     label: "Rank" },
                        ].map(({ key, label }) => (
                           <div
                              key={key}
                              className={`button sort-btn ${sortBy === key ? "active" : ""}`}
                              onClick={() => setSortBy(key)}
                              style={{
                                 backgroundColor: sortBy === key ? "var(--key-bg)" : "var(--bg)",
                                 color: sortBy === key ? "var(--key-text)" : "var(--text)"
                              }}
                           >
                              {label}
                           </div>
                        ))}
                     </div>
                  </div>
                  {/* Table */}

                  { loading 
                     ? <Loading />
                     : <div className="leaderboard-table-wrapper">
                        <table className="leaderboard-table">
                           <thead>
                              <tr>
                                 <th>#</th>
                                 <th>Player</th>
                                 <th>Rank</th>
                                 <th onClick={() => setSortBy("wpm")} className="sortable">
                                    WPM
                                 </th>
                                 <th onClick={() => setSortBy("level")} className="sortable">
                                    Level
                                 </th>
                                 <th onClick={() => setSortBy("accuracy")} className="sortable">
                                    Accuracy
                                 </th>
                                 <th onClick={() => setSortBy("completed")} className="sortable">
                                    Completed
                                 </th>
                              </tr>
                           </thead>
                           <tbody>
                              {sorted.map((entry, index) => {
                                 const position = index + 1;
                                 const medal = getMedalColor(position);
                                 const isMe = isCurrentUser(entry);

                                 return (
                                    <tr
                                       key={index}
                                       className={`leaderboard-row ${isMe ? "is-current-user" : ""}`}
                                    >
                                       {/* Position */}
                                       <td className="col-position">
                                          {medal ? (
                                             <span className="medal" style={{ color: medal }}>
                                                {position === 1 ? "🥇" : position === 2 ? "🥈" : "🥉"}
                                             </span>
                                          ) : (
                                             <span className="position-num">{position}</span>
                                          )}
                                       </td>

                                       {/* Player */}
                                       <td className="col-player">
                                          <div className="player-info">
                                             {entry.photoURL 
                                                ? ( <img src={entry.photoURL} alt="" className="player-avatar" />) 
                                                : ( <div className="player-avatar-placeholder">
                                                      {entry.displayName?.[0]?.toUpperCase() || "?"}
                                                   </div>)
                                             }
                                             <span className={`player-name ${isMe && 'you-badge'}`}>
                                                {entry.email?.split('@')[0] || "?"}
                                             </span>
                                          </div>
                                       </td>

                                       {/* Earned Rank Badge */}
                                       <td className="col-rank-badge">
                                          <span
                                             className="rank-badge"
                                             style={{ color: entry.earnedRank?.color, borderColor: entry.earnedRank?.color }}
                                          >
                                             {entry.earnedRank?.label}
                                          </span>
                                       </td>

                                       {/* WPM */}
                                       <td className="col-wpm">
                                          <span className="wpm-value">{entry.wpm}</span>
                                       </td>

                                       {/* Level */}
                                       <td className="col-level">
                                          <span className="level-chip">{entry.level}</span>
                                       </td>

                                       {/* Accuracy */}
                                       <td className="col-accuracy">{entry.accuracy}%</td>

                                       {/* Tests */}
                                       <td className="col-completed">{entry.testsCompleted}</td>
                                    </tr>
                                 );
                              })}
                           </tbody>
                        </table>
                     </div>
                  }
                  {entries.length === 0 && !loading && (
                     <div className="leaderboard-empty">
                        <p>No entries yet. Be the first on the board!</p>
                     </div>
                  )}
               </div>
         </div>
         </div>
      </div>
   )
}