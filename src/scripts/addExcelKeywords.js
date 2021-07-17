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
    const worksheet = workbook.getWorksheet(1);

    var tenhangColumn = worksheet.getColumn(2);
    var partnumColumn = worksheet.getColumn(1);
    var dvtinhColumn = worksheet.getColumn(3);

    partnumColumn = partnumColumn.values;
    partnumColumn.shift(); partnumColumn.shift();
    // Remove undefined items in array
    for (let i = 0; i < partnumColumn.length; i++) {
        if (partnumColumn[i] == undefined) 
            partnumColumn.splice(i, 1);
    }
    Keywords.addKeyword('partnum', partnumColumn);

    tenhangColumn = tenhangColumn.values;
    tenhangColumn.shift(); tenhangColumn.shift();
    // Remove undefined items in array
    for (let i = 0; i < tenhangColumn.length; i++) {
        if (tenhangColumn[i] == undefined) 
            tenhangColumn.splice(i, 1);
    }
    Keywords.addKeyword('tenhang', tenhangColumn);

    dvtinhColumn = dvtinhColumn.values;
    dvtinhColumn.shift(); dvtinhColumn.shift();
    // Remove undefined items in array
    for (let i = 0; i < dvtinhColumn.length; i++) {
        if (dvtinhColumn[i] == undefined) 
            dvtinhColumn.splice(i, 1);
    }
    Keywords.addKeyword('dvtinh', dvtinhColumn);

    //popup in renderer side
    dialogs.alert('Add Keywords successfully');
}