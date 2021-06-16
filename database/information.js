const firebase = require("firebase");
// Required for side-effects
require("firebase/firestore");

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

var db = firebase.firestore();
var countInfo = 0;

module.exports = {
    save: (body) => {
        countInfo++;
        try {
            var doc = db.collection("info").doc(countInfo).add(body);
            console.log("Add info successfully: ", doc);
        } catch (err) {
            console.log("Error adding info: ", err);
        }
    }
}