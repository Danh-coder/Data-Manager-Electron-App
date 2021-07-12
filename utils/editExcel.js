const Excel = require('exceljs');
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

const addKeyword = () => {

}

module.exports = {
    readKeywordsLinhkien: readKeywordsLinhkien,
    readKeywordsThanhpham: readKeywordsThanhpham,
    addKeyword: addKeyword
}