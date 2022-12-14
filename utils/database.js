const {dialog} = require('electron');
const firebase = require("firebase");
require('dotenv').config();
// Required for side-effects
require("firebase/firestore");

//import { GoogleAuthProvider } from "firebase/auth";
//const provider = new GoogleAuthProvider();





// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: process.env.API_KEY,
    authDomain: process.env.AUTHDOMAIN,
    projectId: process.env.PROJECT_ID,
    storageBucket: process.env.STORAGEBUCKET,
    messagingSenderId: process.env.MSG_SENDER_ID,
    appId: process.env.APPID,
};
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

//popup noti
const popup = (type, title, message) => {
    const options = {type, title, message};
    dialog.showMessageBox(null, options);
}

// -------------------------------------Keywords Processes-------------------------------------
const keywords = db.collection('keywords');
//Read keywords
const read = async (name) => { //Only one aspect
    const doc = await keywords.doc(name).get();
    return await (doc.data().values);
}
const readKeywords = async () => { //All aspects
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
    return {
        tenhang_partnum, tenhang, partnum, sohopdong, sanpham, cty, dvtinh, mcu, chip
    }
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
// Add, remove keywords
const addKeyword = async (aspect, values) => { //Via aspects
    await keywords.doc(aspect).update({
        values: firebase.firestore.FieldValue.arrayUnion(...values)
    })
}
const removeKeyword = async (aspect, values) => { //Via aspects
    await keywords.doc(aspect).update({
        values: firebase.firestore.FieldValue.arrayRemove(...values)
    })
}
const addKeywordLinhkien = async (body) => { //Via type
    await keywords.doc('tenhang + partnum').update({
        values: firebase.firestore.FieldValue.arrayUnion({
            tenhang: body.tenhang,
            partnum: body.partnum
        })
    })

    var keyNames = Object.keys(body);
    keyNames.forEach(async(key) => {
        if (key == 'state' || key == 'dongia' || key == 'quantity' || key == 'thanhtien' || key == 'date' || key == 'submissionDate' || key == 'stthopdong')
            return;
        
        await keywords.doc(key).update({
            values: firebase.firestore.FieldValue.arrayUnion(body[key])
        })
    })
}
const addKeywordThanhpham = async (body) => { //Via type
    await keywords.doc('tenhang + partnum').update({
        values: firebase.firestore.FieldValue.arrayUnion({
            tenhang: body.tenhang,
            partnum: body.partnum
        })
    })

    var keyNames = Object.keys(body);
    keyNames.forEach(async(key) => {
        if (key == 'state' || key == 'quantity' || key == 'date' || key == 'submissionDate' || key == 'stthopdong')
            return;
        
        await keywords.doc(key).update({
            values: firebase.firestore.FieldValue.arrayUnion(body[key])
        })
    })
}

// ---------------------------------Submission Counting---------------------------------
const countSubmissions = async () => {
    const doc = await db.collection('log-linhkien').doc('submissionCount').get();
    return doc.data().value;
}
const increaseSubmissionCount = async (current) => { //stthopdong is editable
    var countRef = db.collection('log-linhkien').doc('submissionCount');
    countRef.update({
        value: current + 1
    })
}

// -------------------------------------Database processes--------------------------------------
const save = async (type, body) => {
    var result; //success or error 
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
            result = {
                success: false,
                error: err
            };
            // dialog.showErrorBox("Can't save this form", err);
            canAdd = false;
        }
    })
    if (isEmpty) {
        obj = {
            tenhang: body.tenhang,
            partnum: body.partnum,
            quantity: body.quantity,
            dvtinh: body.dvtinh
        }
        const doc = await database.add(obj);
        console.log(`Added to ton-${type}: `, doc.id);
    }

    //Add data to log-...
    if (canAdd) {
        //docID: current date ==> Database sorts chronologically
        const docID = new Date().toISOString(); //toISOString: return ISO standard format
        await db.collection(`log-${type}`).doc(docID).set(body);
        console.log(`Added to log-${type}: `, docID);
        result = {success: true};
    }
    return result;
}
const edit = async (state, type, {id, ...body}) => {
    const docRef = await db.collection(`log-${type}`).doc(id).get();
    var result; //success or error
    if (docRef.data().tenhang != body.tenhang) {
        //create a new one
        if (state == 'nhap') result = await save(type, body);
        if (state == 'xuat') result = await xuat(type, body);
        // Delete old document
        if (result.success) {
            await del(state, type, id);
        }
    }
    else {
        var delta = body.quantity - docRef.data().quantity;
        if (state == 'xuat') delta = -delta;

        //Update the ton-... storage as well
        const database = db.collection(`ton-${type}`);
        const querySnapshot = await database.where('tenhang','==',body.tenhang).get();
        for (var i in querySnapshot.docs) {
            const doc = querySnapshot.docs[i];
            if (doc.data().dvtinh == body.dvtinh || doc.data().quantity == docRef.data().quantity) {
                if (state == 'xuat' && doc.data().quantity + delta < 0) {
                    let err = 'This quantity is over what we have in the storage, which is only: ' + (doc.data().quantity + docRef.data().quantity) + " " + doc.data().dvtinh;
                    // dialog.showErrorBox("Can't edit data", err);
                    result = {
                        success: false,
                        error: err
                    }
                }
                else {
                    var newQuantity = (doc.data().dvtinh == body.dvtinh) ? doc.data().quantity + delta : body.quantity;
                    await db.collection(`log-${type}`).doc(id).update(body);
                    await database.doc(doc.id).update({
                        dvtinh: body.dvtinh,
                        quantity: newQuantity
                    })
                    console.log(`Updated log-${type}`);
                    console.log(`Updated ton-${type}`);
                    result = {
                        success: true,
                    }
                }
            }
            else {
                const err = 'Please use the correct unit: ' + doc.data().dvtinh;
                result = {
                    success: false,
                    error: err
                }
            }
        }
    }
    
    return result;
}
const del = async (state, type, id) => {
    var docRef = await db.collection(`log-${type}`).doc(id).get();
    var quantity = docRef.data().quantity;
    quantity = (state == 'xuat') ? -quantity : quantity;
    await db.collection(`log-${type}`).doc(id).delete();
    console.log(`Deleted log-${type}`);

    const querySnapshot = await db.collection(`ton-${type}`).where('tenhang', '==', docRef.data().tenhang).get();
    querySnapshot.forEach(async(doc) => {
        if (doc.data().quantity == quantity) {
            await db.collection(`ton-${type}`).doc(doc.id).delete();
            console.log(`Deleted ton-${type}`);
        }
        else {
            await db.collection(`ton-${type}`).doc(doc.id).update({
                quantity: doc.data().quantity - quantity
            })
            console.log(`Updated ton-${type}`);
        }
    })
}
const delStthopdong = async (state, type, {stthopdong, submissionDate}) => {
    const database = db.collection(`log-${type}`);
    const querySnapshot = await database.where("stthopdong", "==", stthopdong).get();
    for (const doc of querySnapshot.docs) {
        if (doc.data().submissionDate == submissionDate) {
            await del(state, type, doc.id);
        }
    }
}
const xuat = async(type, body) => {
    var result; //success or error
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
                result = {
                    success: false,
                    error: err
                }
                canAdd = false;
            }
        }
        else {
            var err = 'Please use the correct unit: ' + doc.data().dvtinh;
            result = {
                success: false,
                error: err
            }
            canAdd = false;
        }
    })

    //Add data to log-...
    if (isEmpty) {
        var err = "Your wanted product is unavailable in the storage";
        result = {
            success: false,
            error: err
        }
        canAdd = false;
    }
    if (canAdd) {
        //docID: current date ==> Database sorts chronologically
        const docID = new Date().toISOString(); //toISOString: return ISO standard format
        await db.collection(`log-${type}`).doc(docID).set(body);
        console.log(`Added to log-${type}: `, docID);
        result = {
            success: true
        }
    }
    return result;
}
const readAll = async (state, type) => {
    const database = db.collection(`log-${type}`);
    const querySnapshot = await database.get();
    var infos = [];
    querySnapshot.forEach(async(doc) => {
        if (doc.data().state == state) {
            infos.push({
                id: doc.id,
                ...doc.data()
            })
        }
    })
    return await (infos);
}
const readFollowingDate = async (state, type, {datestart, dateend}) => {
    var infos = [];
    var querySnapshot = await db.collection(`log-${type}`).get();
    querySnapshot.forEach(doc => {
        if (doc.data().state == state && datestart <= doc.data().date  && doc.data().date <= dateend) {
            infos.push({
                id: doc.id,
                ...doc.data()
            })
        }
    });
    popup('info', 'Info', `Found: ${infos.length} in ${state}`);
    return await(infos);
}
const readFollowingPartnum = async (state, type, {name}) => {
    var infos = [];
    var querySnapshot = await db.collection(`log-${type}`).get();
    querySnapshot.forEach(doc => {
        if (doc.data().state == state && doc.data().partnum == name) {
            infos.push({
                id: doc.id,
                ...doc.data()
            })
        }
    });
    popup('info', 'Info', `Found: ${infos.length} in ${state}`);
    return await(infos);
}
const readFollowingSohopdong = async (state, type, {sohopdong}) => {
    var infos = [];
    var querySnapshot = await db.collection(`log-${type}`).get();
    querySnapshot.forEach(doc => {
        if (doc.data().state == state && doc.data().sohopdong == sohopdong) {
            infos.push({
                id: doc.id,
                ...doc.data()
            })
        }
    });
    popup('info', 'Info', `Found: ${infos.length} in ${state}`);
    return await(infos);
}
const readFollowingId = async ({type, id}) => {
    const doc = await db.collection(`log-${type}`).doc(id).get();
    const obj = {
        id: doc.id,
        ...doc.data()
    }
    return await (obj);
}
const readFollowingStthopdong = async ({type, stthopdong, submissionDate}) => {
    var infos = [];
    const querySnapshot = await db.collection(`log-${type}`).where("stthopdong", "==", stthopdong).get();
    querySnapshot.forEach(async (doc) => {
        if (doc.data().submissionDate == submissionDate) 
            infos.push({
                id: doc.id,
                ...doc.data()
            })
    })
    return infos;
}
const readStorage = async (type, name) => {
    var infos = [];
    var querySnapshot;
    if (name == '') querySnapshot = await db.collection(`ton-${type}`).get();
    else querySnapshot = await db.collection(`ton-${type}`).where('partnum', '==', name).get();

    querySnapshot.forEach(doc => {
        if (doc.data().quantity != 0) infos.push(doc.data());
    })
    return await (infos);
}

module.exports = {
    save: save,
    edit: edit,
    delete: del,
    deleteFollowingStthopdong: delStthopdong,
    xuat: xuat,
    readAll: readAll,
    readFollowingDate: readFollowingDate,
    readFollowingPartnum: readFollowingPartnum,
    readFollowingSohopdong: readFollowingSohopdong,
    readFollowingId: readFollowingId,
    readFollowingStthopdong: readFollowingStthopdong,
    readStorage: readStorage,

    readKeywords: readKeywords,
    addKeywordLinhkien: addKeywordLinhkien,
    addKeywordThanhpham: addKeywordThanhpham,
    addKeyword: addKeyword,
    removeKeyword: removeKeyword,
    findPairKeywords: findPairKeywords,

    countSubmissions: countSubmissions,
    increaseSubmissionCount: increaseSubmissionCount,
}