// Modules to control application life and create native browser window
const { app, BrowserWindow, Menu, ipcMain } = require('electron')
const path = require('path')
const { readXuat } = require('./utils/database')



function createWindow () {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
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
  mainWindow.webContents.openDevTools()

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

// Get data 
const database = require('./utils/database')
var linhkien_nhap, thanhpham_nhap, linhkien_xuat, thanhpham_xuat;
ipcMain.on('save-linhkien', async(event, obj) => {
  //save to database
  await database.save('linhkien', obj);
  //read data from database
  linhkien_nhap = await database.readLinhkien('nhap');
  console.log(linhkien_nhap);
})

ipcMain.on('save-thanhpham', async (event, obj) => {
  //save to database
  await database.save('thanhpham', obj);
  //read data from database
  thanhpham_nhap = await database.readThanhpham('nhap');
  console.log(thanhpham_nhap);
})

ipcMain.on('xuat-linhkien', async (event, obj) => {
  await database.xuat('linhkien', obj);

  linhkien_xuat = await database.readLinhkien('xuat');
  console.log(linhkien_xuat);
})

ipcMain.on('xuat-thanhpham', async (event, obj) => {
  await database.xuat('thanhpham', obj);

  linhkien_xuat = await database.readThanhpham('xuat');
  console.log(linhkien_xuat);
})