const numeral = require('numeral');
// Grid Table Setup
var _grid = document.getElementById('grid');
var grid = canvasDatagrid({
    parentNode: _grid
});
grid.style.height = '300px';
grid.style.width = '100%';

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
    var btn = $('<button style="display: flex; margin-left: auto; margin-right: auto; align-items: center; justify-content: center; margin-top: 50px; height: 50px; width: 250px; text-align: center; background-color: rgb(49, 197, 49); color: white; border-radius: 3px;"></button>').html(name);
    if (name == 'Nhập') btn.attr('onclick', `display${type}(nhaps)`);
    if (name == 'Xuất') btn.attr('onclick', `display${type}(xuats)`);
    if (name == 'Tồn') btn.attr('onclick', `displayTon(tons, '${type}')`);

    buttons.append(btn);
}

//Update grid data when editing documents
const updateEdition = (rowIndex) => {
    //Mainly update thanhtien, dongia, quantity when one is edited
    if (memKey == 'nhapLinhkien' || memKey == 'xuatLinhkien') { //Only linhkien
        grid.data[rowIndex]['dongia'] = numeral(grid.data[rowIndex]['dongia']).format('0,0.0000'); //Reformat value
        grid.data[rowIndex]['thanhtien'] = numeral(grid.data[rowIndex]['quantity']).value() * numeral(grid.data[rowIndex]['dongia']).value(); //Change quantity or dongia will affect thanhtien
        grid.data[rowIndex]['thanhtien'] = numeral(grid.data[rowIndex]['thanhtien']).format('0,0.0000'); //Reformat value
        grid.data[rowIndex]['quantity'] = numeral(grid.data[rowIndex]['quantity']).format('0,0'); //Reformat value
    }
}
const getEditedDocuments = () => {
    var objs = [];
    for (let index = 0; index < grid.data.length; index++) {
        var obj = JSON.parse(JSON.stringify(grid.data[index])); //Only copy values => Not affect grid.data
        obj.quantity = numeral(obj.quantity).value(); //Grid.data saves it as string
        obj.stthopdong = parseInt(document.getElementById('stthopdong').innerHTML, 10);
        objs.push(obj);
    }    
    return objs;
}

//Print reviews in nhap,xuat
var memKey; //Store state, type of current page
var printReviews = (key) => {
    var arr = reviews[key];
    memKey = key;

    if (key == 'nhapLinhkien' || key == 'xuatLinhkien') displayLinhkienReviews(arr);
    if (key == 'nhapThanhpham' || key == 'xuatThanhpham') displayThanhphamReviews(arr);
}
grid.addEventListener('rendercell', function (e) { //Color the delete buttons
    if (e.cell.columnIndex == 0 && grid.schema[0].title == 'Xóa') { //Only in nhap, xuat pages
        e.ctx.fillStyle = '#ff3838'; //Red
    }
});
grid.addEventListener('click', function (e) { //Remove review when click the delete button
    if (!e.cell) { return; }
    if (e.cell.rowIndex > -1 && e.cell.columnIndex == 0 && grid.schema[0].title == 'Xóa') { //Only in nhap, xuat pages
        removeReview(memKey, e.cell.rowIndex);
        printReviews(memKey);
    }
});
grid.addEventListener('endedit', function (e) { //Update grid after finish editing
    if (!e.cell || e.cell.rowIndex < 0 || memKey == undefined) { return; }
    if (grid.schema[0].title != 'Xóa' && memKey != undefined) { updateEdition(e.cell.rowIndex); return;} //Chinhsua editions

    //Nhap, xuat reviews editions
    console.log(e.cell.rowIndex);
    var newObj = JSON.parse( JSON.stringify(grid.data[e.cell.rowIndex])); //Only copy values
    delete newObj['col0']; //Don't include delete button

    newObj['quantity'] = numeral(newObj['quantity']).format('0,0'); //Grid saves it as string ==> Reformat value
    if (memKey == 'nhapLinhkien' || memKey == 'xuatLinhkien') { //Only linhkien
        newObj['dongia'] = numeral(newObj['dongia']).format('0,0.0000'); //Reformat value
        newObj['thanhtien'] = numeral(newObj['quantity']).value() * numeral(newObj['dongia']).value(); //Change quantity or dongia will affect thanhtien
        newObj['thanhtien'] = numeral(newObj['thanhtien']).format('0,0.0000'); //Reformat value
    }

    updateReview(memKey, e.cell.rowIndex, newObj);
    printReviews(memKey); //Update grid data as well
});

var resize = () => {
    _grid.style.height = '300px';
}
var displayLinhkien = (arr, isReview = false) => {
    _grid.style.display = '';
    resize(); //make the grid more good-looking
    //Add data to the grid
    var tmp = [], totalThanhtien = 0;
    arr.forEach(product => {
        var row = {
            partnum: product.partnum,
            tenhang: product.tenhang,
            sohopdong: product.sohopdong,
            sanpham: product.sanpham,
            cty: product.cty,
            date: product.date,
            dvtinh: product.dvtinh,
            quantity: numeral(product.quantity).format('0,0'),
            dongia: numeral(product.dongia).format('0,0.0000'),
            thanhtien: numeral(product.thanhtien).format('0,0.0000')
        }
        tmp.push(row);
        totalThanhtien += numeral(product.thanhtien).value(); //calculate totalThanhtien
    });
    if (!isReview) tmp.push({thanhtien: numeral(totalThanhtien).format('0,0.0000')}) //display totalThanhtien on the last line
    grid.data = tmp; //grid.data doesn't allow to push each row

    //Rename the header of each column
    grid.schema = [
        {
            title: 'Part Number',
            name: 'partnum',
            width: 300,
        },
        {
            title: 'Tên Hàng',
            name: 'tenhang',
            width: 200,
        },
        {
            title: 'Sổ Hợp Đồng',
            name: 'sohopdong',
            width: 200,
        },
        {
            title: 'Sản Phẩm',
            name: 'sanpham',
            width: 300,
        },
        {
            title: 'Công Ty Nhập',
            name: 'cty',
            width: 300,
        },
        {
            title: 'Ngày Nhập',
            name: 'date',
            width: 150,
        },
        {
            title: 'Đơn Vị Tính',
            name: 'dvtinh',
            width: 75,
        },
        {
            title: 'Số Lượng',
            name: 'quantity',
            type: 'number',
            width: 50,
        },
        {
            title: 'Đơn giá',
            name: 'dongia',
            type: 'number',
            width: 150,
        },
        {
            title: 'Thành Tiền',
            name: 'thanhtien',
            type: 'number',
            width: 200,
        },

    ]
}
var displayThanhpham = (arr) => {
    _grid.style.display = '';
    resize(); //make the grid more good-looking
    //Add data to the grid
    var tmp = [];
    arr.forEach(product => {
        var row = {
            tenhang: product.tenhang,
            mcu: product.mcu,
            sohopdong: product.sohopdong,
            chip: product.chip,
            date: product.date,
            quantity: numeral(product.quantity).format('0,0'),
        }
        tmp.push(row);
    });
    grid.data = tmp; //grid.data doesn't allow to push each row
    //Rename the header of each column
    grid.schema = [
        {
            title: 'Tên Hàng',
            name: 'tenhang',
            width: 200,
        },
        {
            title: 'MCU',
            name: 'mcu',
            width: 150,
        },
        {
            title: 'Sổ Hợp Đồng',
            name: 'sohopdong',
            width: 75,
        },
        {
            title: 'Chip',
            name: 'chip',
            width: 150,
        },
        {
            title: 'Ngày Nhập',
            name: 'date',
            width: 150,
        },
        {
            title: 'Số Lượng',
            name: 'quantity',
            type: 'number',
            width: 50,
        },
    ]
}
var displayTon = (arr, type) => {
    _grid.style.display = '';
    resize(); //make the grid more good-looking
    //Rename the header of each column
    grid.schema = [
        {
            title: 'Tên Hàng/Part number',
            name: 'tenhang/partnum',
        },
        {
            title: 'Số Lượng',
            name: 'quantity',
            type: 'number'
        },
        {
            title: 'Đơn Vị Tính',
            name: 'dvtinh',
        },
    ]   
    if (type == 'Linhkien') grid.schema[0] = {
        title: 'Part Number',
        name: 'partnum',
    }
    if (type == 'Thanhpham') grid.schema[0] = {
        title: 'Tên Hàng',
        name: 'tenhang',
    }
    //Add data to the grid
    var tmp = [];
    arr.forEach(product => {
        var row = {
            quantity: numeral(product.quantity).format('0,0'),
            dvtinh: product.dvtinh,
        }
        if (type == 'Linhkien') row['partnum'] = product.partnum;
        if (type == 'Thanhpham') row['tenhang'] = product.tenhang;
        tmp.push(row);
    });
    grid.data = tmp; //grid.data doesn't allow to push each row
}

var displayLinhkienReviews = (arr) => {
    resize(); //make the grid more good-looking
    //Add data to the grid
    var tmp = [];
    arr.forEach(product => {
        var row = {
            col0: 'X',
            partnum: product.partnum,
            tenhang: product.tenhang,
            sohopdong: product.sohopdong,
            sanpham: product.sanpham,
            cty: product.cty,
            date: product.date,
            dvtinh: product.dvtinh,
            quantity: numeral(product.quantity).format('0,0'),
            dongia: numeral(product.dongia).format('0,0.0000'),
            thanhtien: numeral(product.thanhtien).format('0,0.0000')
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
            name: 'partnum',
            with: 250,
        },
        {
            title: 'Tên Hàng',
            name: 'tenhang',
            width: 200,
        },
        {
            title: 'Sổ Hợp Đồng',
            name: 'sohopdong',
        },
        {
            title: 'Sản Phẩm',
            name: 'sanpham',
        },
        {
            title: 'Công Ty Nhập',
            name: 'cty',
        },
        {
            title: 'Ngày Nhập',
            name: 'date',
        },
        {
            title: 'Đơn Vị Tính',
            name: 'dvtinh',
            width: 75,
        },
        {
            title: 'Số Lượng',
            name: 'quantity',
            type: 'number',
            width: 150,
        },
        {
            title: 'Đơn giá',
            name: 'dongia',
            type: 'number'
        },
        {
            title: 'Thành Tiền',
            name: 'thanhtien',
            type: 'number'
        },
    ]
}
var displayThanhphamReviews = (arr) => {
    resize(); //make the grid more good-looking
    //Add data to the grid
    var tmp = [];
    arr.forEach(product => {
        var row = {
            col0: 'X',
            tenhang: product.tenhang,
            mcu: product.mcu,
            sohopdong: product.sohopdong,
            chip: product.chip,
            date: product.date,
            quantity: numeral(product.quantity).format('0,0'),
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
            name: 'tenhang',
        },
        {
            title: 'MCU',
            name: 'mcu',
        },
        {
            title: 'Sổ Hợp Đồng',
            name: 'sohopdong',
        },
        {
            title: 'Chip',
            name: 'chip',
        },
        {
            title: 'Ngày Nhập',
            name: 'date',
        },
        {
            title: 'Số Lượng',
            name: 'quantity',
            type: 'number'
        },
    ]
}