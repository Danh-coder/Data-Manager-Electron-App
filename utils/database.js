const {BrowserWindow} = require('electron');
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
    saveLinhkien: async (body) => {
        //Add data to ton-... database and check if can add data to log-... or not
        var querySnapshot = await db.collection("ton-linhkien").where("tenhang", "==", body.tenhang).get();
        var isEmpty = true, canAdd = true;
        querySnapshot.forEach(async(doc) => {
            isEmpty = false;
            if (doc.data().dvtinh == body.dvtinh) {
                const res = await db.collection("ton-linhkien").doc(doc.id).update({
                    quantity: (doc.data().quantity + body.quantity),
                });
                console.log("Updated ton-linhkien: ", res);
            }
            else {
                var err = 'Please use the correct unit: ' + doc.data().dvtinh;
                let win = new BrowserWindow({ width: 800, height: 600});
                win.webContents.send('wrong-unit', err);
                canAdd = false;
            }
        })
        if (isEmpty) {
            obj = {
                tenhang: body.tenhang,
                quantity: body.quantity,
                dvtinh: body.dvtinh
            }
            const doc = await db.collection("ton-linhkien").add(obj);
            console.log("Added to ton-linhkien: ", doc.id);
        }

        //Add data to log-...
        if (canAdd) {
            const docRef = await db.collection("log-linhkien").add(body);
            console.log("Added to log-linhkien: ", docRef.id);
        }
    },
    saveThanhpham: async (body) => {
        //Add data to ton-... database and check if can add data to log-... or not
        var querySnapshot = await db.collection("ton-thanhpham").where("tenhang", "==", body.tenhang).get();
        var isEmpty = true, canAdd = true;
        querySnapshot.forEach(async(doc) => {
            isEmpty = false;
            if (doc.data().dvtinh == body.dvtinh) {
                const res = await db.collection("ton-thanhpham").doc(doc.id).update({
                    quantity: (doc.data().quantity + body.quantity),
                });
                console.log("Updated ton-thanhpham: ", res.id);
            }
            else {
                var err = 'Please use the correct unit: ' + doc.data().dvtinh;
                electron.ipcMain.send('wrong-unit', err);
                canAdd = false;
            }
        })
        if (isEmpty) {
            obj = {
                tenhang: body.tenhang,
                quantity: body.quantity,
                dvtinh: body.dvtinh
            }
            const doc = await db.collection("ton-thanhpham").add(obj);
            console.log("Added to ton-thanhpham: ", doc.id);
        }

        //Add data to log-...
        if (canAdd) {
            const docRef = await db.collection("log-thanhpham").add(body);
            console.log("Added to log-thanhpham: ", docRef.id);
        }
    },
    xuat: async(type, body) => {
        const querySnapshot = await db.collection(`ton-${type}`).where('tenhang', '==', body.tenhang).get();
        querySnapshot.forEach(async(doc) => {
            if (body.quantity <= doc.data().quantity) {
                
            }
        })
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
    readNhapThanhpham: async (state) => {
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