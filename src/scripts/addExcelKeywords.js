const Excel = require('exceljs');
const workbook = new Excel.Workbook();
const Dialogs = require('dialogs');
const dialogs = Dialogs();
const Keywords = require('../../utils/keywords');
const fs = require('fs');

const input = document.getElementById('excel');
input.onchange = async (e) => {
    const file = input.files[0];
    const reader = new FileReader();
    reader.readAsArrayBuffer(file);
    reader.onload = async () => {
        const buffer = reader.result;
        await workbook.xlsx.load(buffer);
        processExcelFile();
    }
}

const processExcelFile = () => {
    const worksheet = workbook.getWorksheet('Danh mục VTHH');

    var tenhangColumn = worksheet.getColumn(2);
    var partnumColumn = worksheet.getColumn(1);
    var dvtinhColumn = worksheet.getColumn(4);

    partnumColumn = partnumColumn.values;
    partnumColumn.shift(); partnumColumn.shift();
    Keywords.addKeyword('partnum', partnumColumn);

    tenhangColumn = tenhangColumn.values;
    tenhangColumn.shift(); tenhangColumn.shift();
    Keywords.addKeyword('tenhang', tenhangColumn);

    dvtinhColumn = dvtinhColumn.values;
    dvtinhColumn.shift(); dvtinhColumn.shift();
    Keywords.addKeyword('dvtinh', dvtinhColumn);

    //popup in renderer side
    dialogs.alert('Add Keywords successfully');
}