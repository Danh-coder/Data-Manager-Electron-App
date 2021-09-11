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

//Print reviews in nhap,xuat
var memIdx, memType, memState; //Store type, state of current page and indexes of reviews
var printReviews = async (type, state) => {
    var arr = filter(type, state, reviews);
    memType = type; memState = state;

    if (type == 'linhkien') displayLinhkienReviews(arr);
    if (type == 'thanhpham') displayThanhphamReviews(arr);
}
var filter = (type, state, reviews) => {
    var arr = []; memIdx = [];
    for (var index = 0; index < reviews[type].length; index++) {
        if (reviews[type][index].state == state) {
            arr.push(reviews[type][index]);
            memIdx.push(index); //Store its index of reviews array so as to remove the element later
        }
    }
    return arr;
}
grid.addEventListener('rendercell', function (e) { //Color the delete buttons
    if (e.cell.columnIndex == 0 && grid.schema[0].title == 'Xóa') { //Only in nhap, xuat pages
        e.ctx.fillStyle = '#ff3838'; //Red
    }
});
grid.addEventListener('click', function (e) { //Remove review when click the delete button
    if (!e.cell) { return; }
    if (e.cell.rowIndex > -1 && e.cell.columnIndex == 0 && grid.schema[0].title == 'Xóa') { //Only in nhap, xuat pages
        removeReview(memType, memIdx[e.cell.rowIndex]);
        printReviews(memType, memState);
    }
});

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

var displayLinhkienReviews = (arr) => {
    _grid.style.visibility = 'visible';
    resize(); //make the grid more good-looking
    //Add data to the grid
    var tmp = [];
    arr.forEach(product => {
        var row = {
            col0: 'X',
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
            title: 'Xóa',
            name: 'col0',
            width: 45
        },
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
var displayThanhphamReviews = (arr) => {
    _grid.style.visibility = 'visible';
    resize(); //make the grid more good-looking
    //Add data to the grid
    var tmp = [];
    arr.forEach(product => {
        var row = {
            col0: 'X',
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
            title: 'Xóa',
            name: 'col0',
            width: 45
        },
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