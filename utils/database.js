const {dialog} = require('electron');
const popup = require('./popup');
const firebase = require("firebase");
require('dotenv').config();

// Required for side-effects
require("firebase/firestore");

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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

// -------------------------------------Keywords Processes-------------------------------------
const addKeywordLinhkien = async (body) => {
    await db.collection('keywords').doc('tenhang + partnum').update({
        values: firebase.firestore.FieldValue.arrayUnion({
            tenhang: body.tenhang,
            partnum: body.partnum
        })
    })

    var keyNames = Object.keys(body);
    keyNames.forEach(async(key) => {
        if (key == 'state' || key == 'dongia' || key == 'quantity' || key == 'thanhtien' || key == 'date' || key == 'submissionDate' || key == 'stthopdong')
            return;
        
        await db.collection('keywords').doc(key).update({
            values: firebase.firestore.FieldValue.arrayUnion(body[key])
        })
    })
}
const addKeywordThanhpham = async (body) => {
    await db.collection('keywords').doc('tenhang + partnum').update({
        values: firebase.firestore.FieldValue.arrayUnion({
            tenhang: body.tenhang,
            partnum: body.partnum
        })
    })

    var keyNames = Object.keys(body);
    keyNames.forEach(async(key) => {
        if (key == 'state' || key == 'quantity' || key == 'date' || key == 'submissionDate' || key == 'stthopdong')
            return;
        
        await db.collection('keywords').doc(key).update({
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
const decreaseSubmissionCount = async () => {
    var countRef = db.collection('log-linhkien').doc('submissionCount');
    const doc = await countRef.get();
    countRef.update({
        value: doc.data().value - 1
    })
}

// -------------------------------------Database processes--------------------------------------
const save = async (type, body) => {
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
            partnum: body.partnum,
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
        popup('info', 'Success', 'Save data successfully');

        // //Add keywords
        // if (type == 'linhkien') addKeywordLinhkien(body);
        // else addKeywordThanhpham(body);
        //Now one more submission is done
        if (type == 'linhkien') await increaseSubmissionCount(body.stthopdong); //Only for linhkien documents

        return true;
    }
    else return false;
}
const edit = async (state, type, {id, ...body}) => {
    const docRef = await db.collection(`log-${type}`).doc(id).get();
    var success = true;
    if (docRef.data().tenhang != body.tenhang) {
        //create a new one
        if (state == 'nhap') success = await save(type, body);
        if (state == 'xuat') success = await xuat(type, body);
        // Delete old document
        if (success) {
            await del(state, type, id);

            // Don't count this submission if it's linhkien editing
            if (type == 'linhkien') await decreaseSubmissionCount();
        }
    }
    else {
        var delta = body.quantity - docRef.data().quantity;
        if (state == 'xuat') delta = -delta;

        //Update the ton-... storage as well
        const database = db.collection(`ton-${type}`);
        const querySnapshot = await database.where('tenhang','==',body.tenhang).get();
        querySnapshot.forEach(async(doc) => {
            if (doc.data().dvtinh == body.dvtinh || doc.data().quantity == docRef.data().quantity) {
                if (state == 'xuat' && doc.data().quantity + delta < 0) {
                    let err = 'This quantity is over what we have in the storage, which is only: ' + (doc.data().quantity + docRef.data().quantity) + " " + doc.data().dvtinh;
                    dialog.showErrorBox("Can't edit data", err);
                    success = false;
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
                    popup('info', 'Success', 'Save data successfully');

                    //Add keywords
                    // if (type == 'linhkien') {
                    //     removeKeywordLinhkien(docRef.data());
                    //     addKeywordLinhkien(body);
                    // }
                    // else {
                    //     removeKeywordThanhpham(docRef.data());
                    //     addKeywordThanhpham(body);
                    // }
                }
            }
            else {
                dialog.showErrorBox("Can't edit data", "Please use the correct unit: " + doc.data().dvtinh);
                success = false;
            }
        })
    }

    return success;
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

    //Remove Keywords
    // var body = docRef.data();
    // if (type == 'linhkien') removeKeywordLinhkien(body);
    // else removeKeywordThanhpham(body);
}
const xuat = async(type, body) => {
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
        popup('info', 'Success', 'Save data successfully');

        // //Add keywords
        // if (type == 'linhkien') addKeywordLinhkien(body);
        // else addKeywordThanhpham(body);
        //Now one more submission is done
        if (type == 'linhkien') await increaseSubmissionCount(body.stthopdong); //Only for linhkien documents

        return true;
    }
    else return false;
}
const readAll = async (state, type) => {
    const database = db.collection(`log-${type}`);
    const querySnapshot = await database.orderBy('date', 'asc').get();
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
    var querySnapshot = await db.collection(`log-${type}`).orderBy("date", "asc").get();
    querySnapshot.forEach(doc => {
        if (doc.data().state == state && datestart <= doc.data().date  && doc.data().date <= dateend) {
            infos.push({
                id: doc.id,
                ...doc.data()
            })
        }
    });
    return await(infos);
}
const readFollowingPartnum = async (state, type, {name}) => {
    var infos = [];
    var querySnapshot = await db.collection(`log-${type}`).orderBy("date", "asc").get();
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
    var querySnapshot = await db.collection(`log-${type}`).orderBy("date", "asc").get();
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
    xuat: xuat,
    readAll: readAll,
    readFollowingDate: readFollowingDate,
    readFollowingPartnum: readFollowingPartnum,
    readFollowingSohopdong: readFollowingSohopdong,
    readFollowingId: readFollowingId,
    readStorage: readStorage,
    addKeywordLinhkien: addKeywordLinhkien,
    addKeywordThanhpham: addKeywordThanhpham,
    countSubmissions: countSubmissions,
    increaseSubmissionCount: increaseSubmissionCount,
}