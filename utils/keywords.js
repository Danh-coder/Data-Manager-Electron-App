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

const readKeywords = async () => {
    // var tenhang_partnum, tenhang, partnum, sohopdong, sanpham, cty, dvtinh, mcu, chip;
    const [tenhang_partnum, tenhang, partnum, sohopdong, sanpham, cty, dvtinh, mcu, chip] = await Promise.all([
        read('tenhang + partnum'),
        read('tenhang'),
        read('partnum'),
        read('sohopdong'),
        read('sanpham'),
        read('cty'),
        read('dvtinh'),
        read('mcu'),
        read('chip'),
    ])
    // tenhang_partnum = await read('tenhang + partnum');
    // tenhang = await read('tenhang');
    // partnum = await read('partnum');
    // sohopdong = await read('sohopdong');
    // sanpham = await read('sanpham');
    // cty = await read('cty');
    // dvtinh = await read('dvtinh');
    // mcu = await read('mcu');
    // chip = await read('chip');
    return {
        tenhang_partnum, tenhang, partnum, sohopdong, sanpham, cty, dvtinh, mcu, chip
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

//Find relative tenhang_partnum keywords 
const findPairKeywords = async (value) => {
    var ans = [];
    const doc = await keywords.doc('tenhang + partnum').get();
    const arr = doc.data().values;
    arr.forEach(element => {
        if (element.tenhang == value || element.partnum == value) ans.push(element);
    });
    return ans;
}

module.exports = {
    readKeywords: readKeywords,
    addKeyword: addKeyword,
    removeKeyword: removeKeyword,
    findPairKeywords: findPairKeywords,
}