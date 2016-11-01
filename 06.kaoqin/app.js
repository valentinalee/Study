const _ = require('lodash');
const XLSX = require('xlsx');
const kaoqin = require('./js/kaoqin');

let out_file_path = 'out/out.xlsx';

//刷卡记录sheet
let skWorkbook = XLSX.readFile('data/test.xlsx');
const skSheet = skWorkbook.Sheets['刷卡记录'];
//刷脸记录sheet
let slWorkbook = XLSX.readFile('data/test.xlsx');
const slSheet = slWorkbook.Sheets['刷脸'];


let out_workbook = kaoqin.countKaoQin(slSheet,skSheet);

XLSX.writeFile(out_workbook, out_file_path);