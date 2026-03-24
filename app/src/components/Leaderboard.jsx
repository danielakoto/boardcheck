import React, { useState, useEffect } from 'react'
import toast from 'react-hot-toast';
import { FaTimes, FaCrown } from "react-icons/fa";

import { getLeaderboard } from '../background'

import '../styles/Leaderboard.scss'

const RANK_ORDER = [
   "Noob", "Beginner", "Developing", "Average", "Skilled",
   "Proficient", "Advanced", "Elite", "Expert", "Master",
   "Grandmaster", "Legendary", "Mythic", "Transcendent", "Omniscient"
];

export const Leaderboard = ({ user, colors }) => {
   const [open, setOpen] = useState(false)
   const [entries, setEntries] = useState([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState(null);
   const [sortBy, setSortBy] = useState("wpm");

   useEffect(() => {
      const fetchLeaderboard = async () => {
         try {
            setLoading(true);
            const res = await getLeaderboard();
            console.log(res)
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

      fetchLeaderboard();
   }, []);

   if (loading) return (
      <div className="leaderboard-loading">
         <div className="spinner" />
         <p>Loading leaderboard...</p>
      </div>
   );

   const sorted = [...entries].sort((a, b) => {
      if (sortBy === "wpm") return b.wpm - a.wpm;
      if (sortBy === "accuracy") return b.accuracy - a.accuracy;
      if (sortBy === "level") return b.level - a.level;
      if (sortBy === "tests") return b.testsCompleted - a.testsCompleted;
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
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(5px)',
            color: 'var(--text)',
            display: 'flex',
            borderRadius: '5px',
            boxShadow: 'var(--box-shadow)',
            flexDirection: 'column',
            gap: '2x',
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
                     <p className="leaderboard-subtitle">Top 100 typists on BoardCheck</p>
                  </div>

                  {/* Sort controls */}
                  <div className="leaderboard-sort-bar">
                     {[
                        { key: "wpm",      label: "WPM" },
                        { key: "accuracy", label: "Accuracy" },
                        { key: "level",    label: "Level" },
                        { key: "tests",    label: "Tests" },
                        { key: "rank",     label: "Rank" },
                     ].map(({ key, label }) => (
                        <button
                           key={key}
                           className={`sort-btn ${sortBy === key ? "active" : ""}`}
                           onClick={() => setSortBy(key)}
                        >
                           {label}
                        </button>
                     ))}
                  </div>

                  {/* Table */}
                  <div className="leaderboard-table-wrapper">
                     <table className="leaderboard-table">
                        <thead>
                           <tr>
                              <th>#</th>
                              <th>Player</th>
                              <th>Rank</th>
                              <th>Level</th>
                              <th onClick={() => setSortBy("wpm")} className="sortable">
                                 WPM {sortBy === "wpm" && "▼"}
                              </th>
                              <th onClick={() => setSortBy("accuracy")} className="sortable">
                                 Accuracy {sortBy === "accuracy" && "▼"}
                              </th>
                              <th onClick={() => setSortBy("tests")} className="sortable">
                                 Tests {sortBy === "tests" && "▼"}
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
                                          {entry.photoURL ? (
                                             <img src={entry.photoURL} alt="" className="player-avatar" />
                                          ) : (
                                             <div className="player-avatar-placeholder">
                                                {entry.displayName?.[0]?.toUpperCase() || "?"}
                                             </div>
                                          )}
                                          <span className="player-name">
                                             {entry.displayName}
                                             {isMe && <span className="you-badge">you</span>}
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

                                    {/* Level */}
                                    <td className="col-level">
                                       <span className="level-chip">Lv.{entry.level}</span>
                                    </td>

                                    {/* WPM */}
                                    <td className="col-wpm">
                                       <span className="wpm-value">{entry.wpm}</span>
                                       <span className="wpm-unit"> wpm</span>
                                    </td>

                                    {/* Accuracy */}
                                    <td className="col-accuracy">{entry.accuracy}%</td>

                                    {/* Tests */}
                                    <td className="col-tests">{entry.testsCompleted}</td>
                                 </tr>
                              );
                           })}
                        </tbody>
                     </table>
                  </div>

                  {entries.length === 0 && (
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