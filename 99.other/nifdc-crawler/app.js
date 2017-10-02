const fs = require('fs');
const _ = require('lodash');
const xlsx = require('xlsx');
const nifdc = require('./js/nifdc');


fs.readFile('config.json', (err, data) => {
    if (err) throw err;
    let configObj = JSON.parse(data);
    _.forEach(configObj.dataInfo, function (info) {
        let out_file_path = info.year + '.xlsx';
        if (info.enable) {
            nifdc.createYearWorkbook(info.url, info.extendItems)
                .then((workbook) => {
                    xlsx.writeFile(workbook, out_file_path);
                    console.log(`save file ${out_file_path}`);
                }
                );
        }
    });
});