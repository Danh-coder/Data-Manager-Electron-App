const {BrowserWindow, ipcMain, dialog} = require('electron');
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
    save: async (type, body) => {
        const database = db.collection(`ton-${type}`);
        //Add data to ton-... database and check if can add data to log-... or not
        var querySnapshot = await database.where("tenhang", "==", body.tenhang).get();
        var isEmpty = true, canAdd = true;
        querySnapshot.forEach(async(doc) => {
            isEmpty = false;
            if (doc.data().dvtinh == body.dvtinh) {
                const res = await database.doc(doc.id).update({
                    quantity: (doc.data().quantity + body.quantity),
                });
                console.log(`Updated ton-${type}: `, res);
            }
            else {
                var err = 'Please use the correct unit: ' + doc.data().dvtinh;
                dialog.showErrorBox("Can't save this form", err);
                canAdd = false;
            }
        })
        if (isEmpty) {
            obj = {
                tenhang: body.tenhang,
                quantity: body.quantity,
                dvtinh: body.dvtinh
            }
            const doc = await database.add(obj);
            console.log(`Added to ton-${type}: `, doc.id);
        }

        //Add data to log-...
        if (canAdd) {
            const docRef = await db.collection(`log-${type}`).add(body);
            console.log(`Added to log-${type}: `, docRef.id);
        }
    },
    xuat: async(type, body) => {
        var canAdd = true, isEmpty = true;
        const database = db.collection(`ton-${type}`);
        //Check if can export data and save it in log-...
        const querySnapshot = await database.where('tenhang', '==', body.tenhang).get();
        querySnapshot.forEach(async(doc) => {
            isEmpty = false;
            //Check if there are similar units
            if (doc.data().dvtinh == body.dvtinh) {
                //Check if the storage have enough quantity to release
                if (body.quantity <= doc.data().quantity) {
                    database.doc(doc.id).update({
                        quantity: (doc.data().quantity - body.quantity)
                    })
                    console.log("Updated ton-" + type);
                }
                else {
                    let err = 'This quantity is over what we have in the storage, which is only: ' + doc.data().quantity + " " + doc.data().dvtinh;
                    dialog.showErrorBox("Can't save this form", err);
                    canAdd = false;
                }
            }
            else {
                var err = 'Please use the correct unit: ' + doc.data().dvtinh;
                dialog.showErrorBox("Can't save this form", err);
                canAdd = false;
            }
        })

        //Add data to log-...
        if (isEmpty) {
            var err = "Your wanted product is unavailable in the storage";
            dialog.showErrorBox("Can't save this form", err);
            canAdd = false;
        }
        if (canAdd) {
            const docRef = await db.collection(`log-${type}`).add(body);
            console.log(`Added to log-${type}: `, docRef.id);
        }
    },
    readLinhkien: async (state) => {
        var infos = [];
        try {
            var querySnapshot = await db.collection("log-linhkien").orderBy("date", "asc").get();
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
    readThanhpham: async (state) => {
        var infos = [];
        try {
            var querySnapshot = await db.collection("log-thanhpham").orderBy("date", "asc").get();
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