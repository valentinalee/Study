const _ = require('lodash');
const superagent = require('superagent');
require('superagent-charset')(superagent);
const cheerio = require('cheerio');

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

async function crawlItem(itemUrl) {

    let itemTable = {};
    await superagent.get(itemUrl)
        .charset('gbk')
        .then(function (sres) {
            console.log(`end get ${itemUrl}`);
            let $ = cheerio.load(sres.text);
            let rNum = 0;
            let cNum = 0;
            let rowspans = [];
            let title = $('.articletitle1').text();
            itemTable['title'] = getSheetName(title);
            let data = [];
            $('.articlecontent1 tr').each(function (idxRow, element) {
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
                    let txt = '';
                    $el.find('p > span').each(function (i, e) {
                        txt += $(e).text();
                    });
                    txt = _.trim(txt);
                    row.push(txt);

                    if (idxRow == 0) {
                        cNum = Math.max(cNum, idx);
                    }
                });
                data.push(row);
                rNum = idxRow;
            });

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
        return {
            name: items[0]['name'],
            data: allItemData,
            title: allItemData[0],
        };
    }
    return {};
}

async function crawlYear(yearUrl, extendItems) {
    let results = [];
    await superagent.get(yearUrl)
        .charset('gbk')
        .then(async function (sres) {
            console.log(`end get ${yearUrl}`);
            let $ = cheerio.load(sres.text);
            let items = [];
            $('.ListColumnClass1 > a').each(function (idx, el) {
                let $el = $(el);
                let title = $el.text();
                let name = getSheetName(title);
                let itemUrl = yearUrl + $el.attr('href');
                items.push({ title: title, name: name, itemUrl: itemUrl });
            });
            if (extendItems && extendItems.length > 0) {
                _.forEach(extendItems, function (v, k) {
                    items.push({ title: v.title, name: getSheetName(v.title), itemUrl: v.url });
                })
            }
            items = _.sortBy(items, ['title'], ['desc']);
            let gItems = _.groupBy(items, 'name');
            let promises = _.map(gItems, function (v) {
                return crawlItems(v);
            });
            results = await Promise.all(promises);
        });
    return results;
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
function findColData(item, r, title) {
    let sheetTitle = item.title;
    let idx = _.findIndex(sheetTitle, function (o) { return o == title; });
    if (idx >= 0) {
        return r[idx];
    }
    return null;
}

//判断是否为数据行,通过序号是否为数字进行判断
function isDataRow(item, r) {
    let sq = findColData(item, r, '序号');
    if (isNaN(parseInt(sq))) {
        return false;
    }
    return true;
}

function buildAllSheet(itemDatas) {
    const sheetName = 'name';
    let all_sheet = { name: 'ALL' };
    let all_title = _.concat(sheetName, _.union.apply(this, _.map(itemDatas, 'title')));
    let idxAllRow = 1;
    //合并后的标题行
    _.forEach(all_title, function (title, idxCol) {
        const c = int2colString(idxCol + 1);
        all_sheet[c + idxAllRow] = { v: title };
    });
    idxAllRow++;
    //循环itemDatas，合并数据
    _.forEach(itemDatas, function (item) {
        //循环行
        _.forEach(item.data, function (r, idxRow) {
            if (isDataRow(item, r)) { //仅合并数据行
                //循环列
                _.forEach(all_title, function (title, idxCol) {
                    const c = int2colString(idxCol + 1);
                    if (_.isEqual(title, sheetName)) { //表格名
                        all_sheet[c + idxAllRow] = { v: item.name };
                    } else {
                        let d = findColData(item, r, title);
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
