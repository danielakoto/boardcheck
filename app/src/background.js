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
export const auth = getAuth(app);
const functions = getFunctions(app, 'us-east4')

export const signUp = async (email, password) => {
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
        
        localStorage.setItem("token", token);

        initUserDetails()
        
        return({ res: "Success" });
    } catch (error) {
        if (error.code === "auth/email-already-in-use") {
            return({ res: `Account already exists. Please sign in..` });
        } else {
            return({ res: `Error signing up. Please try again.` });
        }
    }
}

export const signIn = async (email, password) => {

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
            
            localStorage.setItem("token", token);
            
            initUserDetails()
            
        }).catch(error => {
            throw new Error(`${error}`);
        });
        
        return({ res: "Success", user: username });
    } catch (error) {
        return({ res: `Error signing in. Please try again.${error}` });
    }
}
export const signInWithGoogle = async () => {
    try {
        // 1. Get access token via Chrome identity
        const accessToken = await getGoogleToken();

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
        localStorage.setItem("token", token);

        await initUserDetails();

        return({ res: "Success" });

    } catch (error) {
        console.error("Google sign-in error:", error);
        return({ res: `Error signing in. Please try again. ${error.message}` });
    }
}

export const signOutUser = async () => {
    try {
        const token = localStorage.getItem("token");

        if (token) {
            // Revoke the token
            await fetch(`https://accounts.google.com/o/oauth2/revoke?token=${token}`);

            // Revoke via GIS (clears the client-side session)
            google.accounts.oauth2.revoke(token, () => {
                console.error('Token revoked');
            });
        }

        await signOut(auth);

        localStorage.removeItem("token", null);
        localStorage.removeItem("user", null);

        return { res: "Success" };
    } catch (error) {
        return { res: `Error: ${error}, Please try again.` };
    }
};

export const saveScores = async (results) => {
  try {
    const token = localStorage.getItem("token");
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
    
    return({ res: "Success",  data: data});
  } catch (error) {
    return({ res: `Error: ${error}` });   
  }
}

export const saveSettings = async () => {
  try {

    const colors = localStorage.getItem("colors")
    const sound = localStorage.getItem("sound")
    const token = localStorage.getItem("token");

    if(!token) return({ res: "Success",  data: "No user."});
    
    if (isTokenExpired(token)) {
      localStorage.removeItem("token"); // Clear the stale token
      return { res: "Error", data: "Session expired. Please log in again." };
    }

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
    
    const data = await res.json()

    initUserDetails()
    
    return({ res: "Success",  data: data});
  } catch (error) {
    return({ res: `Error: ${error}` });   
  }
}

export const getLeaderboard = async () => {
    try {
        const res = await fetch("https://api-h4rwr3b4ca-uk.a.run.app/get-leaderboard");
        const data = await res.json()
        
        return({ res: "Success",  data: data});
    } catch (error) {
        return({ res: `Error: ${error}` });   
    }
}

const payment = async () => {
    try {
        const uid = getUserUID()
        const functionRef = httpsCallable(functions, 'ext-firestore-stripe-payments-createPortalLink');

        const { data } = await functionRef({
            customerId: uid,
            returnUrl: "https://api-h4rwr3b4ca-uk.a.run.app/success",
            configuration: "bpc_1StLe62LGH0KWWEEhC0CPx1u", // Optional ID of a portal configuration: https://stripe.com/docs/api/customer_portal/configuration
        });

        initUserDetails()

        return({ res: "Success", url: data.url });
    } catch (error) {
        return({ res: `Error: ${error}` });   
    }
}

export const initUserDetails = async () => {
    const authUser = auth.currentUser;
    if(!authUser) {
        return 
    }
    
    const user = await getUserData()
    if(user.email) localStorage.setItem("user", JSON.stringify(user))
}

async function getUserData() {
    const token = localStorage.getItem("token");

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
        const client = google.accounts.oauth2.initTokenClient({
            client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID,
            scope: "openid email profile",  // your required scopes
            callback: (response) => {
                if (response.error) {
                console.error('getAuthToken error:', response.error);
                reject(new Error(response.error));
                return;
                }
                if (!response.access_token) {
                console.error('getAuthToken: no token returned');
                reject(new Error('No token returned'));
                return;
                }
                resolve(response.access_token);
            },
        });

        client.requestAccessToken({ prompt: 'consent' });
    });
};

const isTokenExpired = (token) => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 < Date.now();
  } catch {
    return true; // Treat malformed tokens as expired
  }
};