//Get access to database
require('dotenv').config();
const firebase = require("firebase");
require("firebase/firestore");

const firebaseConfig = {
    apiKey: process.env.API_KEY,
    authDomain: process.env.AUTHDOMAIN,
    projectId: process.env.PROJECT_ID,
    storageBucket: process.env.STORAGEBUCKET,
    messagingSenderId: process.env.MSG_SENDER_ID,
    appId: process.env.APPID,
    measurementId: process.env.MEASUREMENT_ID
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

// Add, remove keywords via aspects
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