const ipc = require('electron').ipcRenderer

const btnSelectSL = document.getElementById('btnSelectSL');
btnSelectSL.addEventListener('click', function (event) {
    ipc.send('open-sl-file-dialog');
})
ipc.on('selected-sl-file', function (event, data) {
    document.getElementById('txtSL').value = data.file;
    if(data.sheets){
        let selSL  = document.getElementById('selSL');
        selSL.options.length = 0;
        for(let i=0;i < data.sheets.length; i++){
            selSL.options.add(new Option(data.sheets[i],data.sheets[i]));
        }
    }
})

const btnSelectSK = document.getElementById('btnSelectSK');
btnSelectSK.addEventListener('click', function (event) {
    ipc.send('open-sk-file-dialog');
})
ipc.on('selected-sk-file', function (event, data) {
    document.getElementById('txtSK').value = data.file;
    if(data.sheets){
        let selSK  = document.getElementById('selSK');
        selSK.options.length = 0;
        for(let i=0;i < data.sheets.length; i++){
            selSK.options.add(new Option(data.sheets[i],data.sheets[i]));
        }
    }
})

const btnSelectOut = document.getElementById('btnSelectOut');
btnSelectOut.addEventListener('click', function (event) {
    ipc.send('open-out-file-dialog');
})
ipc.on('selected-out-file', function (event, path) {
    document.getElementById('txtOut').value = path;
})

const btnOK = document.getElementById('btnOK');
btnOK.addEventListener('click', function (event) {
    let selSL  = document.getElementById('selSL');
    let selSK  = document.getElementById('selSK');
    ipc.send('save-file',{
        slSheet:selSL.options[selSL.selectedIndex].value,
        skSheet:selSK.options[selSK.selectedIndex].value,
        outFile:document.getElementById('txtOut').value
    });
})
ipc.on('saved-file-ok', function (event) {
    alert('成功！');
})

ipc.on('err-msg', function (event, err) {
    alert(err);
})