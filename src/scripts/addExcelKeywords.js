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

    var keyPair = []; //Containing tenhang and partnum values as pairs
    //var added = {}; //Mark if the tenhang has been already added to the array ==> Avoid adding similar tenhangs
    var tenhangColumn = worksheet.getColumn(2);
    var partnumColumn = worksheet.getColumn(1);
    var dvtinhColumn = worksheet.getColumn(3);

    partnumColumn = partnumColumn.values;
    tenhangColumn = tenhangColumn.values;
    //Remove the two first values which are unnecessary
    partnumColumn.shift(); partnumColumn.shift();
    tenhangColumn.shift(); tenhangColumn.shift();
    // Make pairs of tenhang and partnum
    for (let i = 0; i < tenhangColumn.length; i++) {
        if (tenhangColumn[i] == undefined && partnumColumn[i] == undefined) {
            //Remove item out of array
            tenhangColumn.splice(i, 1);
            partnumColumn.splice(i, 1);
        }
        else {
            //Change to the proper values to add to the database successfully
            tenhangColumn[i] = (tenhangColumn[i] == undefined ? "" : tenhangColumn[i]);
            partnumColumn[i] = (partnumColumn[i] == undefined ? "" : partnumColumn[i]);

            keyPair.push({
                tenhang: tenhangColumn[i],
                partnum: partnumColumn[i]
            })
        }
    }
    Keywords.addKeyword('tenhang + partnum', keyPair);
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