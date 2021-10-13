// Grid Table Setup
var _grid = document.getElementById('grid');
var grid = canvasDatagrid({
    parentNode: _grid
});
grid.style.height = '100%';
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
    var btn = $('<button style="display: flex; margin-left: auto; margin-right: auto; align-items: center; justify-content: center; margin-top: 50px; height: 50px; width: 250px; text-align: center; background-color: rgb(49, 197, 49);"></button>').html(name);
    if (name == 'Nhập') btn.attr('onclick', `display${type}(nhaps)`);
    if (name == 'Xuất') btn.attr('onclick', `display${type}(xuats)`);
    if (name == 'Tồn') btn.attr('onclick', `displayTon(tons, '${type}')`);

    buttons.append(btn);
}

//Update grid data when editing documents
const updateEdition = () => {
    //Mainly update thanhtien, dongia, quantity when one is edited
    if (memKey == 'nhapLinhkien' || memKey == 'xuatLinhkien') { //Only linhkien
        grid.data[0]['dongia'] = (parseInt(grid.data[0]['dongia'] * 10000, 10) / 10000).toFixed(4); //Reformat value
        grid.data[0]['thanhtien'] = grid.data[0]['quantity'] * grid.data[0]['dongia']; //Change quantity or dongia will affect thanhtien
        grid.data[0]['thanhtien'] = (parseInt(grid.data[0]['thanhtien'] * 10000, 10) / 10000).toFixed(4); //Reformat value
    }
}
const getEditedDocument = (linhkien = false) => {
    var obj = JSON.parse(JSON.stringify(grid.data[0])); //Only copy values => Not affect grid.data
    obj.quantity = parseInt(obj.quantity, 10); //Grid.data saves it as string
    if (linhkien) obj.stthopdong = document.getElementById('stthopdong').innerHTML;
    return obj;
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
grid.addEventListener('endedit', function (e) { //Update review after finish editing
    if (!e.cell || e.cell.rowIndex < 0 || memKey == undefined) { return; }
    if (grid.schema[0].title != 'Xóa' && memKey != undefined) { updateEdition(); return;} //Chinhsua editions

    //Nhap, xuat editions
    var newObj = JSON.parse( JSON.stringify(grid.data[e.cell.rowIndex])); //Only copy values
    delete newObj['col0']; //Don't include delete button

    newObj['quantity'] = parseInt(newObj['quantity'], 10); //Grid saves it as string ==> Reformat value
    if (memKey == 'nhapLinhkien' || memKey == 'xuatLinhkien') { //Only linhkien
        newObj['dongia'] = (parseInt(newObj['dongia'] * 10000, 10) / 10000).toFixed(4); //Reformat value
        newObj['thanhtien'] = newObj['quantity'] * newObj['dongia']; //Change quantity or dongia will affect thanhtien
        newObj['thanhtien'] = (parseInt(newObj['thanhtien'] * 10000, 10) / 10000).toFixed(4); //Reformat value
    }

    updateReview(memKey, e.cell.rowIndex, newObj);
    printReviews(memKey); //Update grid data as well
});

var resize = () => {
    _grid.style.height = (window.innerHeight - 150) + 'px';
}
var displayLinhkien = (arr) => {
    _grid.style.visibility = 'visible';
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
            quantity: product.quantity,
            dongia: product.dongia,
            thanhtien: product.thanhtien
        }
        tmp.push(row);

        totalThanhtien += parseFloat(product.thanhtien); //calculate totalThanhtien
    });
    tmp.push({thanhtien: totalThanhtien.toFixed(4)}) //display totalThanhtien on the last line
    grid.data = tmp; //grid.data doesn't allow to push each row

    //Rename the header of each column
    grid.schema = [
        {
            title: 'Part Number',
            name: 'partnum',
        },
        {
            title: 'Tên Hàng',
            name: 'tenhang',
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
        },
        {
            title: 'Số Lượng',
            name: 'quantity',
            type: 'number'
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
var displayThanhpham = (arr) => {
    _grid.style.visibility = 'visible';
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
            quantity: product.quantity,
        }
        tmp.push(row);
    });
    grid.data = tmp; //grid.data doesn't allow to push each row
    //Rename the header of each column
    grid.schema = [
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
var displayTon = (arr, type) => {
    _grid.style.visibility = 'visible';
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
            quantity: product.quantity,
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
            quantity: product.quantity,
            dongia: product.dongia,
            thanhtien: product.thanhtien
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
        },
        {
            title: 'Tên Hàng',
            name: 'tenhang',
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
        },
        {
            title: 'Số Lượng',
            name: 'quantity',
            type: 'number'
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
            quantity: product.quantity,
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