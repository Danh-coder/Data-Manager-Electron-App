// Grid Table Setup
var _grid = document.getElementById('grid');
var grid = canvasDatagrid({
    parentNode: _grid
});
grid.style.height = '100%';
grid.style.width = '100%';
// Firestore Database Setup
const firebase = require("firebase");
require("firebase/firestore");
const db = firebase.firestore();

//Print excel in ketxuat
var printExcel = (nhaps, xuats, tons, type) => {
    if (nhaps == undefined && xuats == undefined) return;

    //Remove the recently created buttons
    $('#sheet-buttons').empty();

    //Don't create buttons when data is empty
    createBtn('Nhập', type);
    createBtn('Xuất', type);
    if (tons != undefined) createBtn('Tồn', type);

    //Print the first spreedsheet also the 'Nhập' one
    $('#sheet-buttons button').first().trigger('click');
}
var createBtn = (name, type) => {
    var buttons = $('#sheet-buttons');
    var btn = $('<button style="display: flex; margin-left: auto; margin-right: auto; align-items: center; justify-content: center; margin-top: 50px; height: 50px; width: 250px; text-align: center; background-color: rgb(49, 197, 49);"></button>').html(name);
    if (name == 'Nhập') btn.attr('onclick', `display${type}(nhaps)`);
    if (name == 'Xuất') btn.attr('onclick', `display${type}(xuats)`);
    if (name == 'Tồn') btn.attr('onclick', 'displayTon(tons)');

    buttons.append(btn);
}

//Print recent submissions in nhap,xuat
var printRecentSubmissions = async (type, state) => {
    var submissions = ipcRenderer.sendSync('recent-submissions');
    var arr = await filter(type, state, submissions);
    if (type == 'linhkien') displayLinhkien(arr);
    if (type == 'thanhpham') displayThanhpham(arr);
}
var filter = async (type, state, submissions) => {
    var arr = [];
    for (var index = submissions.length - 1; index >= 0; index--) {
        var id = submissions[index];
        const doc = await db.collection(`log-${type}`).doc(id).get(); //Get document from log-... collection in database 
        if (doc.data().state == state) arr.push(doc.data());
    }
    return arr;
}

var resize = () => {
    _grid.style.height = (window.innerHeight - 150) + 'px';
}
var displayLinhkien = (arr) => {
    _grid.style.visibility = 'visible';
    resize(); //make the grid more good-looking
    //Add data to the grid
    var tmp = [];
    arr.forEach(product => {
        var row = {
            col1: product.partnum,
            col2: product.tenhang,
            col3: product.sohopdong,
            col4: product.sanpham,
            col5: product.cty,
            col6: product.date,
            col7: product.dvtinh,
            col8: product.quantity,
            col9: product.dongia,
            col10: product.thanhtien
        }
        tmp.push(row);
    });
    grid.data = tmp; //grid.data doesn't allow to push each row
    //Rename the header of each column
    grid.schema = [
        {
            title: 'Part Number',
            name: 'col1',
        },
        {
            title: 'Tên Hàng',
            name: 'col2',
        },
        {
            title: 'Sổ Hợp Đồng',
            name: 'col3',
        },
        {
            title: 'Sản Phẩm',
            name: 'col4',
        },
        {
            title: 'Công Ty Nhập',
            name: 'col5',
        },
        {
            title: 'Ngày Nhập',
            name: 'col6',
        },
        {
            title: 'Đơn Vị Tính',
            name: 'col7',
        },
        {
            title: 'Số Lượng',
            name: 'col8',
            type: 'number'
        },
        {
            title: 'Đơn giá',
            name: 'col9',
            type: 'number'
        },
        {
            title: 'Thành Tiền',
            name: 'col10',
            type: 'number'
        },
    ]
}
var displayThanhpham = (arr) => {
    _grid.style.visibility = 'visible';
    resize(); //make the grid more good-looking
    //Add data to the grid
    var tmp = [];
    arr.forEach(product => {
        var row = {
            col1: product.tenhang,
            col2: product.mcu,
            col3: product.sohopdong,
            col4: product.chip,
            col5: product.date,
            col6: product.quantity,
        }
        tmp.push(row);
    });
    grid.data = tmp; //grid.data doesn't allow to push each row
    //Rename the header of each column
    grid.schema = [
        {
            title: 'Tên Hàng',
            name: 'col1',
        },
        {
            title: 'MCU',
            name: 'col2',
        },
        {
            title: 'Sổ Hợp Đồng',
            name: 'col3',
        },
        {
            title: 'Chip',
            name: 'col4',
        },
        {
            title: 'Ngày Nhập',
            name: 'col5',
        },
        {
            title: 'Số Lượng',
            name: 'col6',
            type: 'number'
        },
    ]
}
var displayTon = (arr) => {
    _grid.style.visibility = 'visible';
    resize(); //make the grid more good-looking
    //Add data to the grid
    var tmp = [];
    arr.forEach(product => {
        var row = {
            col1: product.tenhang,
            col2: product.quantity,
            col3: product.dvtinh,
        }
        tmp.push(row);
    });
    grid.data = tmp; //grid.data doesn't allow to push each row
    //Rename the header of each column
    grid.schema = [
        {
            title: 'Tên Hàng',
            name: 'col1',
        },
        {
            title: 'Số Lượng',
            name: 'col2',
            type: 'number'
        },
        {
            title: 'Đơn Vị Tính',
            name: 'col3',
        },
    ]    
}