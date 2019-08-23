//////////////////////////////////////////////////////////////////////
// localizedStrings.js
//
// @usage
//     1. Include this js file.
//         
//         --------------------------------------------------
//         <script type="text/javascript" src="/js/localizedStrings.js"></script>
//         --------------------------------------------------
//         
//     2. Initiate this class from your js file.
//         
//         [sample.js]
//         --------------------------------------------------
//         const localizedStrings = new LocalizedStrings();
//         --------------------------------------------------
//         
//     3. Load json files.
//     
//         When you load a json file.
//         
//         [sample.js]
//         --------------------------------------------------
//         localizedStrings.Load('ja', '/locale/ja.json')
//                 .then(() => {
//                     // When the json file is loaded.
//                 })
//                 .catch((error) => {
//                     // When an error occurred.
//                     console.log(error);
//                 });
//         --------------------------------------------------
//         
//         When you load multiple json files.
//         
//         [sample.js]
//         --------------------------------------------------
//         const p1 = localizedStrings.Load('ja', '/locale/ja.json');
//         const p2 = localizedStrings.Load('en', '/locale/en.json');
//         Promise.all([p1, p2])
//                 .then(() => {
//                     // When the json file is loaded.
//                 })
//                 .catch((error) => {
//                     // When an error occurred.
//                 });
//         --------------------------------------------------
//     
//     
//////////////////////////////////////////////////////////////////////

class LocalizedStrings {

    //////////////////////////////////////////////////////////////////////
    // Constructor
    //////////////////////////////////////////////////////////////////////
    constructor() {
        // Properties
        this.lsExpiresDate = 3;
        this.prefix = 'LocalizedStringsKey.';
        this.lsKeyDate = this.prefix + 'date';
        this.strings = new Object();
    }
    
    
    //////////////////////////////////////////////////////////////////////
    // Load json files
    // If the loaded json data is stored in the local storage, it won't send XHR and
    // get the data from the local storage.
    // @param langCode [string]: The language code such as 'en' or 'ja', etc.
    // @param url [string]: The JSON URL.
    //////////////////////////////////////////////////////////////////////
    Load(langCode, url) {
        return new Promise((resolve, reject) => {
            // Check Local Storage
            const expires = new Date();
            expires.setDate(expires.getDate() + this.lsExpiresDate);
            const lsDate = new Date(window.localStorage.getItem(this.lsKeyDate)).getTime();
            if(lsDate > 0 && expires.getTime() > lsDate) {
                const obj = JSON.parse(window.localStorage.getItem(this.prefix + langCode));
                if(obj != null) {
                    this.strings[langCode] = obj;
                    resolve();
                    return;
                }
            }

            // XHR
            const xhr = new XMLHttpRequest();
            xhr.open("GET", url);
            xhr.onload = () => {
                if(xhr.status === 200) {
                    const resJson = JSON.parse(xhr.responseText);
                    if(resJson != null) {
                        this.strings[langCode] = resJson;
                        window.localStorage.setItem(this.prefix + langCode, JSON.stringify(resJson));
                        window.localStorage.setItem(this.lsKeyDate, new Date().toString());
                        resolve();
                    } else {
                        reject('Invalid a json file. url: ' + url);
                    }
                } else {
                    reject(xhr.status + ' ' + xhr.statusText);
                }
            };
            xhr.onerror = () => reject(xhr.status + ' ' + xhr.statusText);
            xhr.send();
        });
    }
    

    //////////////////////////////////////////////////////////////////////
    // Get a localized string.
    // @param langCode [string]: The language code such as 'en' or 'ja', etc.
    // @param key [string]: The key of the loaded json file.
    // @param defaultVal [string]: The default value when the key is not exist.
    //////////////////////////////////////////////////////////////////////
    String(langCode, key, defaultVal = key) {
        if(this.strings[langCode] != null && this.strings[langCode][key] != null) {
            return this.strings[langCode][key];
        } else {
            return defaultVal;
        }
    }

}
