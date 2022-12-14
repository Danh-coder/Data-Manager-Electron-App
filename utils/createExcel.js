const {dialog} = require('electron');
var Excel = require('exceljs');

//popup noti
const popup = (type, title, message) => {
    const options = {type, title, message};
    dialog.showMessageBox(null, options);
}

function printLinhkien(sheet, arr) {
    sheet.columns = [
        { header: 'Part Number', key: 'partnum', width: 20},
        { header: 'Tên Hàng', key: 'tenhang', width: 20},
        { header: 'Sổ Hợp Đồng', key: 'sohopdong', width: 20},
        { header: 'Sản Phẩm', key: 'sanpham', width: 20},
        { header: 'Công Ty Nhập', key: 'cty', width: 20},
        { header: 'Ngày Nhập', key: 'date', width: 20},
        { header: 'Đơn Vị Tính', key: 'dvtinh', width: 20},
        { header: 'Số Lượng', key: 'quantity', width: 20},
        { header: 'Đơn Giá', key: 'dongia', width: 20},
        { header: 'Thành Tiền', key: 'thanhtien', width: 20},
    ]

    // Add rows in the above header
    var totalThanhtien = 0;
    var numeral = require('numeral');
    arr.forEach(doc => {
        sheet.addRow({
            partnum: doc.partnum,
            tenhang: doc.tenhang,
            sohopdong: doc.sohopdong,
            sanpham: doc.sanpham,
            cty: doc.cty,
            date: doc.date,
            dvtinh: doc.dvtinh,
            quantity: doc.quantity,
            dongia: doc.dongia,
            thanhtien: doc.thanhtien,
        })
        totalThanhtien += numeral(doc.thanhtien).value();
    })
    sheet.addRow({thanhtien: numeral(totalThanhtien).format('0,0.0000')}); //display totalThanhtien on the last line
}
function printThanhpham(sheet, arr) {
    sheet.columns = [
        { header: 'Tên Hàng', key: 'tenhang', width: 20},
        { header: 'MCU', key: 'mcu', width: 20},
        { header: 'Sổ Hợp Đồng', key: 'sohopdong', width: 20},
        { header: 'Chip', key: 'chip', width: 20},
        { header: 'Ngày Nhập', key: 'date', width: 20},
        { header: 'Số Lượng', key: 'quantity', width: 20},
    ]

    // Add rows in the above header
    arr.forEach(doc => {
        sheet.addRow({
            tenhang: doc.tenhang,
            mcu: doc.mcu,
            sohopdong: doc.sohopdong,
            chip: doc.chip,
            date: doc.date,
            quantity: doc.quantity
        })
    })
}
function printTonLinhkien(sheet, arr) {
    sheet.columns = [
        { header: 'Part Number', key: 'partnum', width: 20},
        { header: 'Số Lượng', key: 'quantity', width: 20},
        { header: 'Đơn Vị Tính', key: 'dvtinh', width: 20},
    ]

    // Add rows in the above header
    arr.forEach(doc => {
        sheet.addRow({
            partnum: doc.partnum,
            quantity: doc.quantity,
            dvtinh: doc.dvtinh
        })
    })
}
function printTonThanhpham(sheet, arr) {
    sheet.columns = [
        { header: 'Tên Hàng', key: 'tenhang', width: 20},
        { header: 'Số Lượng', key: 'quantity', width: 20},
        { header: 'Đơn Vị Tính', key: 'dvtinh', width: 20},
    ]

    // Add rows in the above header
    arr.forEach(doc => {
        sheet.addRow({
            tenhang: doc.tenhang,
            quantity: doc.quantity,
            dvtinh: doc.dvtinh
        })
    })
}

module.exports = async function createNewExcelFile(type, nhaps, xuats, tons)
{
    // A new Excel Work Book
    var workbook = new Excel.Workbook();

    // Some information about the Excel Work Book.
    workbook.creator = 'Danh Phan';
    workbook.lastModifiedBy = '';
    workbook.created = new Date();
    workbook.modified = new Date();
    workbook.lastPrinted = new Date();

    // A table header
    var sheet;
    if (type == 'thanhpham') {
        // Create a sheet
        sheet = workbook.addWorksheet('nhap-thanhpham');
        printThanhpham(sheet, nhaps);
        // Create a sheet
        sheet = workbook.addWorksheet('xuat-thanhpham');
        printThanhpham(sheet, xuats);
        //Create a sheet
        if (tons != undefined) {
            sheet = workbook.addWorksheet('ton-thanhpham');
            printTonThanhpham(sheet, tons);
        }
    }
    if (type == 'linhkien') {
        // Create a sheet
        sheet = workbook.addWorksheet('nhap-linhkien');
        printLinhkien(sheet, nhaps);
        //Create a sheet
        sheet = workbook.addWorksheet('xuat-linhkien');
        printLinhkien(sheet, xuats);
        //Create a sheet
        if (tons != undefined) {
            sheet = workbook.addWorksheet('ton-linhkien');
            printTonLinhkien(sheet, tons, type);
        }
    }

    // Save Excel on Hard Disk
    var success;
    try {
        await workbook.xlsx.writeFile("My Excel File.xlsx");
        // Success Message
        success = true;
        console.log('File excel saved');
        popup('info', 'Success', 'File Excel is exported successfully');
    } catch (error) {
        success = false;
        popup('error', 'Failed', `This process isn't completed because the file is open in another app. 
Please close it and try again`);
    }
    return success;
}