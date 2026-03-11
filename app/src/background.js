

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