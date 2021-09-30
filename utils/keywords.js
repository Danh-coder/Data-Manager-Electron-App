//Get access to database
const firebase = require("firebase");
require("firebase/firestore");
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
const keywords = db.collection('keywords');

const read = async (name) => {
    const doc = await keywords.doc(name).get();
    return await (doc.data().values);
}

const readLinhkien = async () => {
    var tenhang_partnum, partnum, sohopdong, sanpham, cty, dvtinh;
    tenhang_partnum = await read('tenhang + partnum');
    partnum = await read('partnum');
    sohopdong = await read('sohopdong');
    sanpham = await read('sanpham');
    cty = await read('cty');
    dvtinh = await read('dvtinh');
    return {
        tenhang_partnum, partnum, sohopdong, sanpham, cty, dvtinh
    }
}

const readThanhpham = async () => {
    var tenhang_partnum, mcu, sohopdong, chip;
    tenhang_partnum = await read('tenhang + partnum');
    mcu = await read('mcu');
    sohopdong = await read('sohopdong');
    chip = await read('chip');
    return {
        tenhang_partnum, mcu, sohopdong, chip
    }
}

const addKeyword = async (aspect, values) => {
    await keywords.doc(aspect).update({
        values: firebase.firestore.FieldValue.arrayUnion(...values)
    })
}
const removeKeyword = async (aspect, values) => {
    await keywords.doc(aspect).update({
        values: firebase.firestore.FieldValue.arrayRemove(...values)
    })
}

module.exports = {
    readLinhkien: readLinhkien,
    readThanhpham: readThanhpham,
    addKeyword: addKeyword,
    removeKeyword: removeKeyword
}