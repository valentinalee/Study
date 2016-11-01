const {app, BrowserWindow} = require('electron');
const ipc = require('electron').ipcMain;
const dialog = require('electron').dialog;
const _ = require('lodash');
const XLSX = require('xlsx');
const kaoqin = require('./js/kaoqin');

//刷卡记录excel
let skWorkbook = null;
//刷脸记录excel
let slWorkbook = null;

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

function sendError(sender,err){
    sender.send('err-msg',err.message);
}

ipc.on('open-sl-file-dialog', function (event) {
    dialog.showOpenDialog({
        properties: ['openFile'],
        filters: [
            { name: 'Excel(*.xls,*.xlsx)', extensions: ['xls', 'xlsx'] },
        ]
    }, function (files) {
        if (files && files.length > 0){
            try {
                slWorkbook = XLSX.readFile(files[0]);
                event.sender.send('selected-sl-file', {file:files[0],sheets:slWorkbook.SheetNames});
            } catch (err) {
                sendError(event.sender,err);
            }
        } 
    })
})

ipc.on('open-sk-file-dialog', function (event) {
    dialog.showOpenDialog({
        properties: ['openFile'],
        filters: [
            { name: 'Excel(*.xls,*.xlsx)', extensions: ['xls', 'xlsx'] },
        ]
    }, function (files) {
        if (files && files.length > 0){
            try {
                skWorkbook = XLSX.readFile(files[0]);
                event.sender.send('selected-sk-file', {file:files[0],sheets:skWorkbook.SheetNames});
            } catch (err) {
                sendError(event.sender,err);
            }
        } 
    })
})

ipc.on('open-out-file-dialog', function (event) {
    dialog.showSaveDialog({
        title: '保存结果',
        filters: [
            { name: 'Excel(*.xlsx)', extensions: ['xlsx'] },
        ]
    }, function (filename) {
        if (filename) event.sender.send('selected-out-file', filename)
    })
})

ipc.on('save-file', function (event,data) {
    try {
        //刷卡记录sheet
        const skSheet = skWorkbook.Sheets[data.skSheet];
        //刷脸记录sheet
        const slSheet = slWorkbook.Sheets[data.slSheet];
        let out_workbook = kaoqin.countKaoQin(slSheet,skSheet);
        XLSX.writeFile(out_workbook, data.outFile);
        event.sender.send('saved-file-ok', 'ok');
    } catch (err) {
        sendError(event.sender,err);
    }
})