const firebase = require("firebase");
// Required for side-effects
require("firebase/firestore");

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyB9-dEkmcl8UZxMGOuuNixbWOTV56dvuGg",
    authDomain: "fir-dcb51.firebaseapp.com",
    projectId: "fir-dcb51",
    storageBucket: "fir-dcb51.appspot.com",
    messagingSenderId: "646138430424",
    appId: "1:646138430424:web:4d7aaf370d3cd93343a8ad",
    measurementId: "G-72YX6WP7VW"
  };

firebase.initializeApp(firebaseConfig);

const db = firebase.firestore();

module.exports = {
    readLinhkien: async (state) => {
        var infos = [];
        try {
            var querySnapshot = await db.collection("linh-kien").orderBy("date", "asc").get();
            querySnapshot.forEach(doc => {
                if (doc.data().state == state) {
                    infos.push({
                        id: doc.id,
                        ...doc.data()
                    })
                }
            });
            return await(infos);
        } finally {}
    },
    readNhapThanhpham: async (state) => {
        var infos = [];
        try {
            var querySnapshot = await db.collection("thanh-pham").orderBy("date", "asc").get();
            querySnapshot.forEach(doc => {
                if (doc.data().state == state) {
                    infos.push({
                        id: doc.id,
                        ...doc.data()
                    })
                }
            });
            return await(infos);
        } finally {}
    }
}