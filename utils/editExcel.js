const Excel = require('exceljs');
const Dialogs = require('dialogs');
const dialogs = Dialogs();
var workbook = new Excel.Workbook();

const readExcel = (name) => {
    var keys = [];
    var worksheet = workbook.getWorksheet(name);
    worksheet.eachRow((row) => {
        row.eachCell((cell) => {
            keys.push({label: cell.value});
        })
    })
    return keys;
}

const readKeywordsLinhkien = async () => {
    var tenhang, partnum, sohopdong, sanpham, cty, dvtinh;
    await workbook.xlsx.readFile('keywords.xlsx');
    tenhang = readExcel('tenhang');
    partnum = readExcel('partnum');
    sohopdong = readExcel('sohopdong');
    sanpham = readExcel('sanpham');
    cty = readExcel('cty');
    dvtinh = readExcel('dvtinh');
    return await {
        tenhang, partnum, sohopdong, sanpham, cty, dvtinh
    }
}

const readKeywordsThanhpham = async () => {
    var tenhang, mcu, sohopdong, chip;
    await workbook.xlsx.readFile('keywords.xlsx');
    tenhang = readExcel('tenhang');
    mcu = readExcel('mcu');
    sohopdong = readExcel('sohopdong');
    chip = readExcel('chip');
    return await {
        tenhang, mcu, sohopdong, chip
    }
}

const addKeyword = async (sheet, name) => {
    await workbook.xlsx.readFile('keywords.xlsx');
    var worksheet = workbook.getWorksheet(sheet);
    worksheet.addRow([name]);
    await workbook.xlsx.writeFile('keywords.xlsx');

    //popup in renderer side
    await dialogs.alert('Add Keywords successfully');
}

module.exports = {
    readKeywordsLinhkien: readKeywordsLinhkien,
    readKeywordsThanhpham: readKeywordsThanhpham,
    addKeyword: addKeyword
}