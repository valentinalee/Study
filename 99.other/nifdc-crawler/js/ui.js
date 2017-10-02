const ipc = require('electron').ipcRenderer

const btnSelectOut = document.getElementById('btnSelectOut');
btnSelectOut.addEventListener('click', function (event) {
    ipc.send('open-out-file-dialog');
})
ipc.on('selected-out-file', function (event, path) {
    document.getElementById('txtOut').value = path;
})

const btnOK = document.getElementById('btnOK');
btnOK.addEventListener('click', function (event) {
    ipc.send('save-file',{
        outFile:document.getElementById('txtOut').value
    });
})
ipc.on('saved-file-ok', function (event,msg) {
    alert(msg);
})

ipc.on('err-msg', function (event, err) {
    alert(err);
})

ipc.on('log', function (event, msg) {
    let logList = document.getElementById('logList');
    logList.innerHTML += `<li> ${msg} </li>`;
})