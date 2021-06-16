// Modules to control application life and create native browser window
const { app, BrowserWindow, Menu, ipcMain } = require('electron')
const path = require('path')



function createWindow () {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    title: "Data Manager",
    minHeight:500,
    minWidth:600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  })
  Menu.setApplicationMenu(null)
  mainWindow.loadFile('src/index.html')

  // Open the DevTools.
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

//Catch item:add
const info = require('./database/information');
ipcMain.on('obj:add', (e, obj) => {
    console.log(obj);
    info.save(obj);
})