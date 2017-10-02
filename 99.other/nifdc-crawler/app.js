const fs = require('fs');
const _ = require('lodash');
const xlsx = require('xlsx');
const nifdc = require('./js/nifdc');

let out_file_path = 'out.xlsx';

nifdc.createYearWorkbook('http://www.nifdc.org.cn/CL0108/')
    .then((workbook) => {
        xlsx.writeFile(workbook, out_file_path);
    }
    );