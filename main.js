const {app, BrowserWindow, ipcMain} = require('electron');
const path = require('path');

const createWindow = () => {
    const mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js')
        }
    });

    mainWindow.loadFile(path.join(__dirname, '/src/index.html'))

    app.whenReady().then(() => {
        createWindow()
      
        app.on('activate', function () {
          if (BrowserWindow.getAllWindows().length === 0) createWindow()
        })
    })

    app.on('window-all-closed', () => {
        if (process.platform !== 'win32') app.quit();
    })
}

//Catch item:add
const info = require('./database/information');
ipcMain.on('obj:add', (e, obj) => {
    console.log(obj);
    info.save(obj);
})