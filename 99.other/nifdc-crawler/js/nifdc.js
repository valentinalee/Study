const _ = require('lodash');
const superagent = require('superagent');
require('superagent-charset')(superagent);
const cheerio = require('cheerio');

const SQ_COL_NAME = '序号';
const AMOUNT_OLD_COL_NAME = '批量/进口量';
const AMOUNT_VALUE_COL_NAME = '数量';
const AMOUNT_UNIT_COL_NAME = '单位';
const SHEET_NAME = 'NAME';

//excel列字母编号转为数字（以1开始）
function colString2int(str) {
    let col = 0;
    for (let i = str.length - 1; i >= 0; i--) {
        col += (str.charCodeAt(str.length - i - 1) - 64) * Math.pow(26, i);
    }
    return col;
}

//excel列数字序号转为字母编号（以1开始）
function int2colString(num) {
    let charArray = [];
    let n = num;
    while (n >= 1) {
        let a = n % 26;
        charArray.unshift(String.fromCharCode((a == 0 ? 26 : a) + 64));
        n = Math.floor(n / 26);
        if (a == 0) {
            n--;
        }
    }
    return charArray.join('');
}

function getSheetName(title) {
    let lIdx = title.lastIndexOf("（");
    let rIdx = title.lastIndexOf("）");
    return _.trim(title.substr(lIdx + 1, rIdx - lIdx - 1));
}

function isSpecialCharacter(code) {
    if (code <= 0x206F && code >= 0x2000) {
        return true;
    }
    return false;
}

//判断行是否存在数据
function hasData(r) {
    for (var i = 0; i < r.length; i++) {
        let v = r[i];
        if (v && !isSpecialCharacter(v.codePointAt(0))) {
            return true;
        }
    }
    return false;
}

async function crawlItem(itemUrl) {

    let itemTable = {};
    await superagent.get(itemUrl)
        .charset('gbk')
        .then(function (sres) {
            console.log(`end get ${itemUrl}`);
            let $ = cheerio.load(sres.text);
            let rowspans = [];
            let title = $('.articletitle1').text();
            itemTable['title'] = getSheetName(title);
            let data = [];
            let tbs = $('.articlecontent1 table');
            if (tbs.length > 0) {
                let tb = $(tbs[tbs.length - 1]);
                $(tb).find('tr').each(function (idxRow, element) {
                    let item = {};
                    let colOffset = 0;
                    let row = [];
                    $(element).find('td').each(function (idxCol, el) {
                        let idx = idxCol + colOffset;
                        if (rowspans[idx] > 1) {
                            row.push(data[idxRow - 1][idx]);
                            colOffset++;
                            rowspans[idx] = rowspans[idx] - 1;
                            idx++;
                        }
                        let $el = $(el);
                        rowspan = parseInt($el.attr('rowspan'));
                        if (isNaN(rowspan)) {
                            rowspans[idx] = 1;
                        } else {
                            rowspans[idx] = parseInt(rowspan);
                        }
                        let txt = $el.text();
                        txt = _.trim(txt);
                        row.push(txt);
                    });
                    //跳过内容为空的行
                    if (hasData(row)) {
                        data.push(row);
                    }
                });
            }

            itemTable.data = data;
        });

    return itemTable;
}

async function crawlItems(items) {
    let oItems = _.sortBy(items, ['title']);
    let allItemData = [];

    for (let i = 0; i < oItems.length; i++) {
        let item = oItems[i];
        let itemTable = await crawlItem(item.itemUrl);
        allItemData = _.concat(allItemData, itemTable.data);
    }
    if (items && items.length > 0 && allItemData.length > 0) {
        //处理标题，去除标题中间空格
        let titleRow = allItemData[0];
        _.forEach(titleRow, function (v, k) {
            titleRow[k] = _.replace(v, ' ', '');
        });
        //增加序号列
        let sq = findColData(titleRow, titleRow, SQ_COL_NAME);
        if (!(sq == SQ_COL_NAME)) { //不存在序号列
            titleRow.push(SQ_COL_NAME);
            for (let idx = 1; idx < allItemData.length; idx++) { //跳过标题行
                let row = allItemData[idx];
                row.push(idx.toString());
            }
        }
        return {
            name: items[0]['name'],
            data: allItemData,
            title: titleRow,
        };
    }
    return null;
}

async function crawlYear(yearUrl, extendItems) {
    let results = [];
    await superagent.get(yearUrl)
        .charset('gbk')
        .then(async function (sres) {
            console.log(`end get ${yearUrl}`);
            let $ = cheerio.load(sres.text);
            let items = [];
            if (extendItems && extendItems.length > 0) {
                _.forEach(extendItems, function (v, k) {
                    items.push({ title: v.title, name: getSheetName(v.title), itemUrl: v.url });
                })
            }
            $('.ListColumnClass1 > a').each(function (idx, el) {
                let $el = $(el);
                let title = $el.text();
                let name = getSheetName(title);
                let itemUrl = yearUrl + $el.attr('href');
                items.push({ title: title, name: name, itemUrl: itemUrl });
            });
            let gItems = _.groupBy(items, 'name');
            let promises = _.map(gItems, function (v) {
                return crawlItems(v);
            });
            results = await Promise.all(promises);
        });
    return _.compact(results);
}

function buildSheet(itemData) {
    let item_sheet = {};
    let allItemData = itemData.data;

    let titleRow = itemData.title;
    item_sheet['name'] = itemData.name;
    item_sheet['!ref'] = 'A1:' + int2colString(titleRow.length) + (allItemData.length);
    item_sheet['!cols'] = [{ wch: 6 }];
    for (let i = 0; i < allItemData.length; i++) {
        let row = allItemData[i];
        for (let j = 0; j < row.length; j++) {
            let col = row[j];
            const c = int2colString(j + 1);
            item_sheet[c + (i + 1)] = { v: col };
        }
    }

    return item_sheet;
}

//查找对应列数据
function findColData(titleRow, r, title) {
    let idx = _.findIndex(titleRow, function (o) { return o == title; });
    if (idx >= 0) {
        return r[idx];
    }
    return null;
}

//判断是否为数据行,通过序号是否为数字进行判断
function isDataRow(titleRow, r) {
    let sq = findColData(titleRow, r, SQ_COL_NAME);
    if (isNaN(parseInt(sq))) {
        return false;
    }
    return true;
}

function buildAllSheet(itemDatas) {
    let all_sheet = { name: 'ALL' };
    let all_title = _.concat(SHEET_NAME, _.union.apply(this, _.map(itemDatas, 'title')));
    let idxAllRow = 1;
    //合并后的标题行
    all_title.push(AMOUNT_VALUE_COL_NAME);
    all_title.push(AMOUNT_UNIT_COL_NAME);
    _.forEach(all_title, function (title, idxCol) {
        const c = int2colString(idxCol + 1);
        all_sheet[c + idxAllRow] = { v: title };
    });
    idxAllRow++;
    //循环itemDatas，合并数据
    _.forEach(itemDatas, function (item) {
        //循环行
        _.forEach(item.data, function (r, idxRow) {
            if (isDataRow(item.title, r)) { //仅合并数据行
                let amount = findColData(item.title, r, AMOUNT_OLD_COL_NAME);
                //循环列
                _.forEach(all_title, function (title, idxCol) {
                    const c = int2colString(idxCol + 1);
                    if (_.isEqual(title, SHEET_NAME)) { //表格名
                        all_sheet[c + idxAllRow] = { v: item.name };
                    } else if (_.isEqual(title, AMOUNT_OLD_COL_NAME)) {
                        all_sheet[c + idxAllRow] = { v: amount ? amount : '' };
                    } else if (_.isEqual(title, AMOUNT_VALUE_COL_NAME)) {
                        let aValue = amount.match(/\d+/);
                        let av = aValue ? aValue[0] : 0;
                        all_sheet[c + idxAllRow] = { t: 'n', v: av };
                    } else if (_.isEqual(title, AMOUNT_UNIT_COL_NAME)) {
                        let aUnit = amount.match(/\D+/);
                        let au = aUnit ? aUnit[0] : '';
                        all_sheet[c + idxAllRow] = { v: au };
                    } else {
                        let d = findColData(item.title, r, title);
                        all_sheet[c + idxAllRow] = { v: d ? d : '' };
                    }
                });
                idxAllRow++;
            }
        });
    })

    all_sheet['!ref'] = 'A1:' + int2colString(all_title.length) + idxAllRow;
    all_sheet['!cols'] = [{ wch: 24 }, { wch: 4 }];

    return all_sheet;
}

function buildWorkbook(itemDatas) {
    let out_workbook = {};

    let sheets = {};
    _.forEach(itemDatas, function (itemData) {
        let sheet = buildSheet(itemData);
        sheets[sheet['name']] = sheet;
    });
    let all_sheet = buildAllSheet(itemDatas);
    out_workbook = {
        SheetNames: _.concat(all_sheet.name, _.keys(sheets)),
        Sheets: sheets
    };
    sheets[all_sheet['name']] = all_sheet;

    return out_workbook;
}

async function createYearWorkbook(yearUrl, extendItems) {
    let itemDatas = await crawlYear(yearUrl, extendItems);
    return buildWorkbook(itemDatas);
}

exports.createYearWorkbook = createYearWorkbook;
