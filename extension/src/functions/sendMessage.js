/* eslint-disable no-undef */
export const sendMessage = (msg) =>
   new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(msg, (response) => {
      if (chrome.runtime.lastError) {
         console.warn("[BoardCheck] sendMessage failed:", chrome.runtime.lastError.message)
         reject(chrome.runtime.lastError)
      } else {
         resolve(response)
      }
      })
   }
)