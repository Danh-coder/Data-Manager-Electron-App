// Modules to control application life and create native browser window
const { app, BrowserWindow, Menu, ipcMain } = require('electron')
const path = require('path')
const { readXuat } = require('./utils/database')


var mainWindow;
function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    title: "Data Manager",
    minHeight:500,
    minWidth:600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      contextIsolation: false,
    }
  })
  Menu.setApplicationMenu(null)
  mainWindow.loadFile('src/index.html')

//   Open the DevTools.
  // mainWindow.webContents.openDevTools()
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})

// Work with database, excel file
const database = require('./utils/database')
const createExcelFile = require('./utils/createExcel');
// Linh kien
ipcMain.on('save-linhkien', async(event, obj) => {
  await database.save('linhkien', obj);
})
ipcMain.on('xuat-linhkien', async (event, obj) => {
  await database.xuat('linhkien', obj);
})
ipcMain.on('doc-ton-linhkien', async (event, {name}) => {
  const tons = await database.readStorage('linhkien', name);
  event.returnValue = tons;
})
ipcMain.on('excel-linhkien', async (event, state) => {
  await createExcelFile('linhkien', state[0], state[1], state[2]);
})

  // Nhap ////////////////////
ipcMain.on('doc-nhap-linhkien-all', async (event, obj) => {
  var nhap = await database.readAll('nhap', 'linhkien');

  event.returnValue = nhap;
});
ipcMain.on('doc-nhap-linhkien-ngay', async (event, obj) => {
  var nhap = await database.readFollowingDate('nhap', 'linhkien', obj);

  event.returnValue = nhap;
})
ipcMain.on('doc-nhap-linhkien-ten', async (event, obj) => {
  var nhap = await database.readFollowingName('nhap', 'linhkien', obj);

  event.returnValue = nhap;
})
ipcMain.on('edit-nhap-linhkien', async (event, obj) => {
  const success = await database.edit('nhap', 'linhkien', obj);
  event.returnValue = success;
})
ipcMain.on('xoa-nhap-linhkien', async (event, id) => {
  await database.delete('nhap', 'linhkien', id);
})
  //Xuat ////////////////
ipcMain.on('doc-xuat-linhkien-all', async (event, obj) => {
  var xuat = await database.readAll('xuat', 'linhkien');

  event.returnValue = xuat;
});
ipcMain.on('doc-xuat-linhkien-ngay', async (event, obj) => {
  var xuat = await database.readFollowingDate('xuat', 'linhkien', obj);

  event.returnValue = xuat;
})
ipcMain.on('doc-xuat-linhkien-ten', async (event, obj) => {
  var xuat = await database.readFollowingName('xuat', 'linhkien', obj);

  event.returnValue = xuat;
})
ipcMain.on('edit-xuat-linhkien', async (event, obj) => {
  const success = await database.edit('xuat', 'linhkien', obj);
  event.returnValue = success;
})
ipcMain.on('xoa-xuat-linhkien', async (event, id) => {
  await database.delete('xuat', 'linhkien', id);
})

// Thanh pham
ipcMain.on('save-thanhpham', async (event, obj) => {
  await database.save('thanhpham', obj);
})
ipcMain.on('xuat-thanhpham', async (event, obj) => {
  await database.xuat('thanhpham', obj);
})
ipcMain.on('doc-ton-thanhpham', async (event, {name}) => {
  const tons = await database.readStorage('thanhpham', name);
  event.returnValue = tons;
})
ipcMain.on('excel-thanhpham', async (event, state) => {
  await createExcelFile('thanhpham', state[0], state[1], state[2]);
})

  // Nhap //////////////////
ipcMain.on('doc-nhap-thanhpham-all', async (event, obj) => {
  var nhap = await database.readAll('nhap', 'thanhpham');

  event.returnValue = nhap;
});
ipcMain.on('doc-nhap-thanhpham-ngay', async (event, obj) => {
  var nhap = await database.readFollowingDate('nhap', 'thanhpham', obj);

  event.returnValue = nhap;
})
ipcMain.on('doc-nhap-thanhpham-ten', async (event, obj) => {
  var nhap = await database.readFollowingName('nhap', 'thanhpham', obj);

  event.returnValue = nhap;
})
ipcMain.on('edit-nhap-thanhpham', async (event, obj) => {
  const success = await database.edit('nhap', 'thanhpham', obj);
  event.returnValue = success;
})
ipcMain.on('xoa-nhap-thanhpham', async (event, id) => {
  await database.delete('nhap', 'thanhpham', id);
})

  // Xuat ////////////////////
ipcMain.on('doc-xuat-thanhpham-all', async (event, obj) => {
  var xuat = await database.readAll('xuat', 'thanhpham');

  event.returnValue = xuat;
});
ipcMain.on('doc-xuat-thanhpham-ngay', async (event, obj) => {
  var xuat = await database.readFollowingDate('xuat', 'thanhpham', obj);

  event.returnValue = xuat;
})
ipcMain.on('doc-xuat-thanhpham-ten', async (event, obj) => {
  var xuat = await database.readFollowingName('xuat', 'thanhpham', obj);

  event.returnValue = xuat;
})
ipcMain.on('edit-xuat-thanhpham', async (event, obj) => {
  const success = await database.edit('xuat', 'thanhpham', obj);
  event.returnValue = success;
})
ipcMain.on('xoa-xuat-thanhpham', async (event, id) => {
  await database.delete('xuat', 'thanhpham', id);
})

// Edit file in general ///////////////////////
ipcMain.on('edit-send', async (event, obj) => {
  let doc = await database.readFollowingId(obj);
  mainWindow.webContents.once('dom-ready', () => {
    mainWindow.webContents.send('edit-receive', doc);
  });
})