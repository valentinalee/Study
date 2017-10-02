const { app, BrowserWindow } = require('electron');
const ipc = require('electron').ipcMain;
const dialog = require('electron').dialog;
const _ = require('lodash');
const xlsx = require('xlsx');
const nifdc = require('./js/nifdc');
const fs = require('fs');
const path = require('path');

let win

let appPath = app.getAppPath();
let configFilePath = null;
if (appPath.endsWith('asar')) {
    appPath += ".unpacked";
}
configFilePath = path.join(appPath, "config.json");

function createWindow() {
    // Create the browser window.
    win = new BrowserWindow({ width: 450, height: 450 })

    win.setMenuBarVisibility(false);
    win.loadURL(`file://${__dirname}/index.html`);
    // win.webContents.openDevTools({mode:"bottom"});

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

function sendError(sender, err) {
    sender.send('err-msg', err.message);
}

ipc.on('open-out-file-dialog', function (event) {
    dialog.showOpenDialog({
        title: '保存结果',
        properties: ['openDirectory']
    }, function (filename) {
        if (filename) event.sender.send('selected-out-file', filename);
    })
})

ipc.on('save-file', function (event, data) {
    try {
        fs.readFile(configFilePath, (err, cfg) => {
            if (err) {
                sendError(event.sender, err);
            } else {

                try {
                    let configObj = JSON.parse(cfg);
                    _.forEach(configObj.dataInfo, function (info) {
                        let out_file_path = path.join(data.outFile, info.year + '.xlsx');
                        if (info.enable) {
                            nifdc.createYearWorkbook(info.url, info.extendItems)
                                .then((workbook) => {
                                    xlsx.writeFile(workbook, out_file_path);
                                    console.log(`save file ${out_file_path} ok`);
                                    event.sender.send('log', `保存文件 ${out_file_path} 成功！`);
                                }
                                );
                        }
                    });
                    event.sender.send('log', `请等待!`);
                } catch (err) {
                    sendError(event.sender, err);
                }
            }
        });
    } catch (err) {
        sendError(event.sender, err);
    }
})