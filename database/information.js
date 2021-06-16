const firebase = require("firebase");
// Required for side-effects
require("firebase/firestore");

const firebaseConfig = {
    apiKey: "AIzaSyB9-dEkmcl8UZxMGOuuNixbWOTV56dvuGg",
    authDomain: "fir-dcb51.firebaseapp.com",
    projectId: "fir-dcb51",
    storageBucket: "fir-dcb51.appspot.com",
    messagingSenderId: "646138430424",
    appId: "1:646138430424:web:4d7aaf370d3cd93343a8ad",
    measurementId: "G-72YX6WP7VW"
}
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