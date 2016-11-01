const ipc = require('electron').ipcRenderer

const btnSelectSL = document.getElementById('btnSelectSL')
btnSelectSL.addEventListener('click', function (event) {
    ipc.send('open-sl-file-dialog')
})
ipc.on('selected-sl-file', function (event, path) {
    document.getElementById('txtSL').value = path;
})

const btnSelectSK = document.getElementById('btnSelectSK')
btnSelectSK.addEventListener('click', function (event) {
    ipc.send('open-sk-file-dialog')
})
ipc.on('selected-sk-file', function (event, path) {
    document.getElementById('txtSK').value = path;
})