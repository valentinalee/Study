const _ = require('lodash');
const xlsx = require('xlsx');
const nifdc = require('./js/nifdc');

let out_file_path = 'out.xlsx';

// nifdc.crawlItem('http://www.nifdc.org.cn/CL0873/9773.html')
//     .then((sheet) => {

//         let sheets = {};
//         sheets[sheet['title']] = sheet;

//         let out_workbook = {
//             SheetNames: _.concat(sheet['title']),
//             Sheets: sheets
//         };
//         xlsx.writeFile(out_workbook, out_file_path);
//     }
//     );

nifdc.crawlYear('http://www.nifdc.org.cn/CL0108/')
    .then((workbook) => {
        xlsx.writeFile(workbook, out_file_path);
    }
    );