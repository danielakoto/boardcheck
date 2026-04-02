/* eslint-disable no-undef */
import { initializeApp } from "firebase/app";
import { getFunctions } from "firebase/functions";
import { getAuth, GoogleAuthProvider, createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithCredential, signOut } from "firebase/auth/web-extension";

const firebaseConfig = {
  apiKey: "AIzaSyA4hLmQ8B43Q0dBZ_T8tdxmlEoBiakSLAI",
  authDomain: "boardcheck-5d311.firebaseapp.com",
  projectId: "boardcheck-5d311",
  storageBucket: "boardcheck-5d311.firebasestorage.app",
  messagingSenderId: "91837916881",
  appId: "1:91837916881:web:135fae28ec06114b6987f0",
  measurementId: "G-NES43QCLWB"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const functions = getFunctions(app, 'us-east4')

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "signUp") {
      const { email, password } = message;
      signUp(email, password, sendResponse);
      return true; 
  }
  if (message.action === "signIn") {
      const { email, password } = message;
      signIn(email, password, sendResponse );
      return true  
  }
  if (message.action === "signInWithGoogle") {
      signInWithGoogle(sendResponse);
      return true  
  }
  if (message.action === "signOut") {
      signOutUser(sendResponse);
      return true  
  }
  if (message.action === "checkToken") {
      (async () => {
          try {
              const { token } = message;
              const result = await checkToken(token);
              sendResponse({ res: result })
          } catch (error) {
              sendResponse({ res: error })
          }
      })();
      return true  
  }
  if(message.action === "initUserDetails") {
      updateDetails(sendResponse)
      return true
  }
  if(message.action === "saveScores") {
    const { results } = message;

      saveScores(results, sendResponse)
      return true
  }
  if(message.action === "saveSettings") {
      saveSettings(sendResponse)
      return true
  }
  if(message.action === "getLeaderboard") {
      getLeaderboard(sendResponse)
      return true
  }

});

const signUp = async (email, password, sendResponse) => {
  console.log("trying to sign up")
    try {
        const userCredential = await createUserWithEmailAndPassword(
            auth,
            email,
            password
        );
        
        const user = userCredential.user;
        const token = await user.getIdToken(true);
        
        // Send token to backend to create Firestore profile
        await fetch("https://api-h4rwr3b4ca-uk.a.run.app/create-user", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
            }
        });
        
        chrome.storage.local.set({ token: token })
        chrome.storage.local.set({ scan: true })

        initUserDetails()
        
        sendResponse({ res: "Success" });
    } catch (error) {
        if (error.code === "auth/email-already-in-use") {
            sendResponse({ res: `Account already exists. Please sign in..` });
        } else {
            sendResponse({ res: `Error signing up. Please try again.` });
        }
    }
}

const signIn = async (email, password, sendResponse) => {

    try {
        let username = ""
        await signInWithEmailAndPassword(
            auth, 
            email, 
            password
        ).then(async cred => {
            const user = cred.user;
            username = user.email
            const token = await user.getIdToken(true);
            
            chrome.storage.local.set({ token: token })
            
            initUserDetails()
            
        }).catch(error => {
            throw new Error(`${error}`);
        });
        
        sendResponse({ res: "Success", user: username });
    } catch (error) {
        sendResponse({ res: `Error signing in. Please try again.${error}` });
    }
}
const signInWithGoogle = async (sendResponse) => {
    try {
        // 1. Get access token via Chrome identity
        const accessToken = await getGoogleToken();

        console.log(accessToken)

        // 2. Fetch user info AND id token using access token
        const idTokenRes = await fetch(
            `https://oauth2.googleapis.com/tokeninfo?access_token=${accessToken}`
        );
        const idTokenData = await idTokenRes.json();
        const idToken = idTokenData.id_token;

        // 3. Use BOTH id token and access token for Firebase credential
        const credential = GoogleAuthProvider.credential(idToken, accessToken);
        const userCredential = await signInWithCredential(auth, credential);
        const user = userCredential.user;

        // 4. Check if this is a new or existing user
        const isNewUser = userCredential._tokenResponse?.isNewUser ?? false;

        // 5. Get Firebase ID token
        const token = await user.getIdToken(true);

        console.log(token)

        // 6. Only call create-user if new, otherwise just fetch their profile
        if (isNewUser) {
            await fetch("https://api-h4rwr3b4ca-uk.a.run.app/create-user", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                }
            });
        }

        // 7. Store token and defaults
        await chrome.storage.local.set({ token });

        // 8. Load user's credits, plan, etc.
        await initUserDetails();

        sendResponse({ res: "Success" });

    } catch (error) {
        console.error("Google sign-in error:", error);
        sendResponse({ res: `Error signing in. Please try again. ${error.message}` });
    }
}

const signOutUser = async (sendResponse) => {
    try {
        chrome.identity.getAuthToken({ interactive: false }, async (token) => {
            if (token) {
                await fetch(`https://accounts.google.com/o/oauth2/revoke?token=${token}`);
                chrome.identity.removeCachedAuthToken({ token });
            }
        });
        signOut(auth).then(() => {
            chrome.storage.local.set({ token: null })
            chrome.storage.local.set({ user: null })

            return "Success"
        })
        sendResponse({ res: "Success" });
    } catch (error) {
        sendResponse({ res: `Error: ${error}, Please try again.` });
    }
}


const saveScores = async (results, sendResponse) => {
  console.log(results)
  try {
    const { token } = await chrome.storage.local.get("token");
    const res = await fetch("https://api-h4rwr3b4ca-uk.a.run.app/save-scores", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        "wpm": results.wpm,
        "accuracy": results.accuracy,
        "correctWords": results.correctWords,
        "incorrectWords": results.incorrectWords,
        "timeElapsed": results.timeElapsed,
        "totalWords": results.totalWords,
        "rank": {
            "label": "Noob",
            "color": "#ff2c2c"
        },
        "level": {
            "level": 0,
            "next": {}
        }
      })
    });
    const data = await res.json()

    initUserDetails()
    
    sendResponse({ res: "Success",  data: data});
  } catch (error) {
    sendResponse({ res: `Error: ${error}` });   
  }
}

const saveSettings = async (sendResponse) => {
    console.log("Running function")
    try {
        const { colors } = await chrome.storage.local.get("colors")
        const { sound } = await chrome.storage.local.get("sound")
        const { token } = await chrome.storage.local.get("token")
        
        console.log("Running saveSettings")
        const res = await fetch("https://api-h4rwr3b4ca-uk.a.run.app/save-settings", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                colors: JSON.parse(colors),
                sound: JSON.parse(sound)
            })
        });
        console.log(res)
        
        const data = await res.json()

        initUserDetails()
        
        sendResponse({ res: "Success",  data: data});
    } catch (error) {
        sendResponse({ res: `Error: ${error}` });   
    }
}

const getLeaderboard = async (sendResponse) => {
    try {
        const res = await fetch("https://api-h4rwr3b4ca-uk.a.run.app/get-leaderboard");
        const data = await res.json()
        
        sendResponse({ res: "Success", data: data});
    } catch (error) {
        sendResponse({ res: `Error: ${error}` });   
    }
}

const payment = async (sendResponse) => {
    try {
        const uid = getUserUID()
        const functionRef = httpsCallable(functions, 'ext-firestore-stripe-payments-createPortalLink');

        const { data } = await functionRef({
            customerId: uid,
            returnUrl: "https://api-h4rwr3b4ca-uk.a.run.app/success",
            configuration: "bpc_1StLe62LGH0KWWEEhC0CPx1u", // Optional ID of a portal configuration: https://stripe.com/docs/api/customer_portal/configuration
        });

        initUserDetails()

        sendResponse({ res: "Success", url: data.url });
    } catch (error) {
        sendResponse({ res: `Error: ${error}` });   
    }
}



// HELPER FUNCTIONS 

const initUserDetails = async () => {
    const authUser = auth.currentUser;
    if(!authUser) {
        return 
    }
    
    const user = await getUserData()

    chrome.storage.local.set({ user: user })
}

const getUserData = async () => {
    const { token } = await chrome.storage.local.get("token");

    const res = await fetch("https://api-h4rwr3b4ca-uk.a.run.app/get-user-data", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      }
    })

    const data = await res.json()

    return data;
}

const getGoogleToken = () => {
    return new Promise((resolve, reject) => {
        chrome.identity.getAuthToken({ interactive: true }, (token) => {
            if (chrome.runtime.lastError) {
                console.error('getAuthToken error:', chrome.runtime.lastError.message);
                reject(chrome.runtime.lastError);
                return;
            }
            if (!token) {
                console.error('getAuthToken: no token returned');
                reject(new Error('No token returned'));
                return;
            }
            resolve(token);
        });
    });
}
