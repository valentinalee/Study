const {app, BrowserWindow} = require('electron')
const ipc = require('electron').ipcMain
const dialog = require('electron').dialog

let win

function createWindow() {
    // Create the browser window.
    win = new BrowserWindow({ width: 450, height: 150 })

    win.setMenuBarVisibility(false);
    win.loadURL(`file://${__dirname}/index.html`)

    win.on('closed', () => {
        win = null
    })
}

app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', () => {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (win === null) {
        createWindow()
    }
})

ipc.on('open-sl-file-dialog', function (event) {
    dialog.showOpenDialog({
        properties: ['openFile'],
        filters: [
            { name: 'Excel', extensions: ['xls', 'xlsx'] },
        ]
    }, function (files) {
        if (files) event.sender.send('selected-sl-file', files)
    })
})

ipc.on('open-sk-file-dialog', function (event) {
    dialog.showOpenDialog({
        properties: ['openFile'],
        filters: [
            { name: 'Excel', extensions: ['xls', 'xlsx'] },
        ]
    }, function (files) {
        if (files) event.sender.send('selected-sk-file', files)
    })
})