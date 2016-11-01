const _ = require('lodash');
const moment = require('moment');

function countKaoQin(slSheet,skSheet){
    //错误名称纠正数据
    const errUserNames = [{from:'王月',to:'王玥'},{from:'陈文利',to:'陈文莉'}];
    function correctUserName(fName){
        let u = _.find(errUserNames,['from',fName]);
        if(u){
            return u.to;
        }
        return fName;
    }

    //excel列字母编号转为数字（以1开始）
    function colString2int(str){
        let col = 0;
        for(let i = str.length - 1 ;i >= 0 ;i--){
            col += (str.charCodeAt(str.length - i -1) - 64) * Math.pow(26,i);
        }
        return col;
    }

    //excel列数字序号转为字母编号（以1开始）
    function int2colString(num){
        let charArray = [];
        let n = num;
        while(n >= 1){
            let a = n % 26 ;
            charArray.unshift( String.fromCharCode((a == 0 ? 26 : a) + 64 ));
            n = Math.floor(n/26);
            if(a==0){
                n--;
            }
        }
        return charArray.join('');
    }

    //获取excel的边界
    function getSheetRange(sheet){
        let sRange = sheet['!ref'].split(':')[1];
        const rangeReg = /([A-Z]+)(\d+)/;
        let r = rangeReg.exec(sRange);
        return {col:colString2int(r[1]),row:parseInt(r[2])};
    }

    //获取cell的值
    function getCellValue(cell){
        if(cell){
            if(cell.t === 's'){
                return cell.v;
            } else if(cell.t === 'n'){
                return cell.w;
            }
            return cell.v;
        }
        return '';
    }

    //解析刷卡sheet
    function parseSKSheet(sk_sheet){
        const sk_sheet_row_skip = 5;

        //刷卡记录sheet的开始时间
        let startDate = moment(sk_sheet['C3'].v.slice(0,10),'YYYY/MM/DD');
        let sk_range = getSheetRange(sk_sheet);

        //总人数
        const totalNum = (sk_range.row - sk_sheet_row_skip) / 2 ; 
        //刷卡记录数据
        let sk_data = [];
        //循环excel格子，读取数据
        for( let i=0;i<totalNum;i++ ) {
            const r = sk_sheet_row_skip + i * 2 + 1;
            const username = correctUserName(getCellValue(sk_sheet['K' + r])); //人名
            for(let j=1;j<=sk_range.col;j++){
                const c = int2colString(j);
                let time_value = getCellValue(sk_sheet[c + (r+1) ]);
                if(time_value){
                    let times = [];
                    let tNum = Math.floor(time_value.length / 5); 
                    for(let k= 0;k < tNum; k ++){
                        times.push(time_value.slice(k*5,k*5 + 5) + ':00');
                    }
                    sk_data.push({name:username,date:startDate.clone().add(j-1,'d').format('YYYY-MM-DD'),times:times});
                }
            }
        }
        return sk_data;
    }

    //解析刷脸sheet
    function parseSLSheet(sl_sheet){
        const sl_sheet_row_skip = 1;

        let sl_range = getSheetRange(sl_sheet);
        //刷脸记录数据
        let sl_data = [];
        for (let i=sl_sheet_row_skip + 1; i<= sl_range.row; i++){
            const username = correctUserName(getCellValue(sl_sheet['C' + i])); //人名
            const date = getCellValue(sl_sheet['E' + i]);
            if(username && date){
                let times = [];
                let col = 'F'.charCodeAt(0);
                let timeV = getCellValue(sl_sheet[String.fromCharCode(col) + i]);
                while (timeV) {
                    if(timeV.length === 8){
                        times.push(timeV);
                    } else {
                        times.push('0' + timeV);
                    }
                    col += 1;
                    timeV = getCellValue(sl_sheet[String.fromCharCode(col) + i]);
                }
                sl_data.push({name:username,date:date,times:times});
            }
        }
        return sl_data;
    }

    let skData = parseSKSheet(skSheet);
    let slData = parseSLSheet(slSheet);

    //合并结果
    _.forEach(slData,function(v) {
        let idx = _.findIndex(skData,{name:v.name,date:v.date});
        if(idx >= 0){
            v.times = _.concat(v.times,skData[idx].times);
            skData.splice(idx,1);
        }
    });
    let allData = _.concat(slData,skData);
    allData = _.orderBy(allData,['name', 'date'], ['asc', 'asc']);
    //提取出最早和最晚时间
    _.forEach(allData,function(v) {
        v.times = _.orderBy(v.times);
        if(v.times.length > 1){
            v.start = v.times[0];
            v.end = v.times[v.times.length -1];
        } else if(v.times.length === 1){
            v.start = v.times[0];
            v.end = v.times[0];
        }
    });

    let all_user = _.uniq(_.map(allData, 'name'));

    //输出结果到excel文件
    //ALL sheet
    let out_all_sheet = {};
    out_all_sheet['!ref'] = 'A1:E' + (allData.length + 1);
    out_all_sheet['!cols'] = [{wch:8},{wch:10},{wch:8},{wch:8},{wch:100}];
    //表头
    out_all_sheet['A1'] = { v: 'name' };
    out_all_sheet['B1'] = { v: 'date' };
    out_all_sheet['C1'] = { v: 'start' };
    out_all_sheet['D1'] = { v: 'end' };
    out_all_sheet['E1'] = { v: 'times' };
    for(let i=0;i<allData.length;i++){
        let r = i + 2;
        out_all_sheet['A' + r] = { v: allData[i].name };
        out_all_sheet['B' + r] = { v: allData[i].date };
        out_all_sheet['C' + r] = { v: allData[i].start };
        out_all_sheet['D' + r] = { v: allData[i].end };
        out_all_sheet['E' + r] = { v: allData[i].times.join() };
    }

    //每人一个sheet
    let sheets = {};
    _.forEach(all_user,function(v){
        let ls = _.filter(allData, ['name', v]);
        let sheet = {};
        sheet['!ref'] = 'A1:D' + (ls.length);
        sheet['!cols'] = [{wch:8},{wch:10},{wch:8},{wch:8}];
        for(let i=0;i<ls.length;i++){
            let r = i + 1;
            sheet['A' + r] = { v: ls[i].name };
            sheet['B' + r] = { v: ls[i].date };
            sheet['C' + r] = { v: ls[i].start };
            sheet['D' + r] = { v: ls[i].end };
        }
        sheets[v] = sheet; 
    });

    //汇总 sheet
    let total_sheet = {};
    total_sheet['!ref'] = 'A1:B' + (all_user.length + 1);
    total_sheet['!cols'] = [{wch:8},{wch:10}];
    //表头
    total_sheet['A1'] = { v: '名称' };
    total_sheet['B1'] = { v: '考勤天' };
    for(let i=0;i<all_user.length;i++){
        let r = i + 2;
        let ls = _.filter(allData, ['name', all_user[i]]);
        total_sheet['A' + r] = { v: all_user[i] };
        total_sheet['B' + r] = { v: ls.length };
    }

    let out_workbook = {
        SheetNames: _.concat('汇总',_.keys(sheets),'ALL'),
        Sheets: sheets
    };

    sheets['汇总'] = total_sheet;
    sheets['ALL'] = out_all_sheet;

    return out_workbook;
}

exports.countKaoQin = countKaoQin;
