module.exports = function createNewExcelFile(state, type, docs)
{
    var Excel = require('exceljs');
    // A new Excel Work Book
    var workbook = new Excel.Workbook();

    // Some information about the Excel Work Book.
    workbook.creator = 'Danh Phan';
    workbook.lastModifiedBy = '';
    workbook.created = new Date();
    workbook.modified = new Date();
    workbook.lastPrinted = new Date();

    // Create a sheet
    var sheet = workbook.addWorksheet(state + type);
    // A table header
    if (type == 'linhkien') {
        sheet.columns = [
            { header: 'Tên Hàng', key: 'tenhang'},
            { header: 'Part Number', key: 'partnum'},
            { header: 'Sổ Hợp Đồng', key: 'sohopdong'},
            { header: 'Sản Phẩm', key: 'sanpham'},
            { header: 'Công Ty Nhập', key: 'cty'},
            { header: 'Ngày Nhập', key: 'date'},
            { header: 'Đơn Vị Tính', key: 'dvtinh'},
            { header: 'Số Lượng', key: 'quantity'},
            { header: 'Đơn Giá', key: 'dongia'},
            { header: 'Thành Tiền', key: 'thanhtien'},
        ]

        // Add rows in the above header
        docs.forEach(doc => {
            
        })
        sheet.addRow({id: 1, course: 'HTML', url:'https://vlemonn.com/tutorial/html' });
        sheet.addRow({id: 2, course: 'Java Script', url: 'https://vlemonn.com/tutorial/java-script'});
        sheet.addRow({id: 3, course: 'Electron JS', url: 'https://vlemonn.com/tutorial/electron-js'});
        sheet.addRow({id: 4, course: 'Node JS', url: 'https://vlemonn.com/tutorial/node-js'});
    }
    if (type == 'thanhpham') {
        sheet.columns = [
            { header: 'Tên Hàng', id: 'tenhang'},
            { header: 'MCU', id: 'mcu'},
            { header: 'Sổ Hợp Đồng', id: 'sohopdong'},
            { header: 'Chip', id: 'chip'},
            { header: 'Ngày Nhập', id: 'date'},
            { header: 'Số Lượng', id: 'quantity'},
        ]
    }

    // Save Excel on Hard Disk
    workbook.xlsx.writeFile("My Excel File.xlsx")
    .then(function() {
        // Success Message
        console.log('File excel saved');
    });
}