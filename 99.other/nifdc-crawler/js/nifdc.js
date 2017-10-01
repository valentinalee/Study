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
    return _.trim(title.substr(title.lastIndexOf("（")));
}

async function crawlItem(itemUrl) {

    let item_sheet = {};
    await superagent.get(itemUrl)
        .charset('gbk')
        .then(function (sres) {
            console.log(`end get ${itemUrl}`);
            let $ = cheerio.load(sres.text);
            let rNum = 0;
            let cNum = 0;
            let rowspans = [];
            let title = $('.articletitle1').text();
            item_sheet['title'] = getSheetName(title);
            $('.articlecontent1 tr').each(function (idxRow, element) {
                let item = {};
                let colOffset = 0;
                $(element).find('td').each(function (idxCol, el) {
                    let idx = idxCol + colOffset;
                    if (rowspans[idx] > 1) {
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
                    const c = int2colString(idx + 1);
                    let txt = '';
                    $el.find('p > span').each(function (i, e) {
                        txt += $(e).text();
                    });
                    item_sheet[c + (idxRow + 1)] = { v: txt };

                    if (idxRow == 0) {
                        cNum = Math.max(cNum, idx);
                    }
                });
                rNum = idxRow;
            });

            item_sheet['!ref'] = 'A1:' + int2colString(cNum + 1) + (rNum + 1);
            item_sheet['!cols'] = [{ wch: 8 }, { wch: 10 }];

        });

    return item_sheet;
}


async function crawlYear(yearUrl) {

    let out_workbook = {};
    await superagent.get(yearUrl)
        .charset('gbk')
        .then(async function (sres) {
            console.log(`end get ${yearUrl}`);
            let $ = cheerio.load(sres.text);
            let promises = [];
            $('.ListColumnClass1 > a').each(function (idx, el) {
                let $el = $(el);
                let name = getSheetName($el.text());
                let itemUrl = yearUrl + $el.attr('href');
                promises.push(crawlItem(itemUrl));
            });
            let results = await Promise.all(promises);

            let sheets = {};
            _.forEach(results, function (sheet) {
                sheets[sheet['title']] = sheet;
            });
            out_workbook = {
                SheetNames: _.concat(_.keys(sheets)),
                Sheets: sheets
            };

        });
    return out_workbook;
}

exports.crawlItem = crawlItem;
exports.crawlYear = crawlYear;
