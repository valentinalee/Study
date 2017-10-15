package main

import (
	"sort"
	"fmt"
	"net/http"
	"strconv"
	"strings"
	"regexp"

	"github.com/PuerkitoBio/goquery"
	"golang.org/x/net/html/charset"
	"github.com/tealeg/xlsx"
)

const SQ_COL_NAME = "序号"
const AMOUNT_OLD_COL_NAME = "批量/进口量"
const AMOUNT_VALUE_COL_NAME = "数量"
const AMOUNT_UNIT_COL_NAME = "单位"
const SHEET_NAME = "NAME"

type NifdcConfigExtend struct {
	Name string `json:"name,omitempty"`
	Title string `json:"title,omitempty"`
	URL   string `json:"url,omitempty"`
}

type ExtendItemSlice []NifdcConfigExtend
func (s ExtendItemSlice) Len() int { return len(s) }
func (s ExtendItemSlice) Swap(i, j int) { s[i], s[j] = s[j], s[i] }
func (s ExtendItemSlice) Less(i, j int) bool { return s[i].Title < s[j].Title }

type NifdcConfigInfo struct {
	Enable      bool                `json:"enable,omitempty"`
	Year        string              `json:"year,omitempty"`
	URL         string              `json:"url,omitempty"`
	ExtendItems ExtendItemSlice `json:"extendItems,omitempty"`
}

type NifdcConfig struct {
	DataInfo []NifdcConfigInfo `json:"dataInfo,omitempty"`
}

type DataRow = []string

type DataTable struct {
	Name string
	Title string
	TitelRow DataRow
	Data  []DataRow
}

type Nifdc struct {
	config *NifdcConfig
	logFunc func(msg string)
}

func (n *Nifdc) init(config *NifdcConfig) {
	n.config = config
}

func (n *Nifdc) crawlItem(itemUrl string) *DataTable {
	res, err := http.Get(itemUrl)
	if err != nil {
		fmt.Println(err.Error())
	} else {
		defer res.Body.Close()
		utfBody, err := charset.NewReader(res.Body, "gb18030")
		if err != nil {
			fmt.Println(err.Error())
		} else {
			doc, _ := goquery.NewDocumentFromReader(utfBody)
			dt := new(DataTable)
			dt.Title = doc.Find(".articletitle1").Text()
			dt.Name = n.getSheetName(dt.Title)
			var rowspans []int
			tb := doc.Find(".articlecontent1 table").Last()
			tb.Find("tr").Each(func(idxRow int, r *goquery.Selection) {

				colOffset := 0
				var row DataRow
				r.Find("td").Each(func(idxCol int, c *goquery.Selection) {
					idx := idxCol + colOffset
					if len(rowspans) <= idxCol {
						rowspans = append(rowspans, 1)
					}
					if rowspans[idx] > 1 {
						row = append(row, dt.Data[idxRow-1][idx])
						colOffset++
						rowspans[idx] = rowspans[idx] - 1
						idx++
					}
					sRowspan, _ := c.Attr("rowspan")
					rowspan, err := strconv.Atoi(sRowspan)
					if err != nil {
						rowspans[idx] = 1
					} else {
						rowspans[idx] = rowspan
					}
					row = append(row, strings.TrimSpace(c.Text()))

				})
				//跳过内容为空的行
				if (n.hasData(&row)) {
					dt.Data = append(dt.Data, row)
				}
			})

			return dt
		}
	}
	return nil
}

func (n *Nifdc) crawlItems(items ExtendItemSlice) *DataTable{
	sort.Stable(items)
    oItems := items
    var allItemData []DataRow

    for i := range oItems {
        item := oItems[i];
		n.log(fmt.Sprintf("fetch %s %s",item.Title,item.URL))
        itemTable := n.crawlItem(item.URL);
        allItemData = append(allItemData, itemTable.Data...);
    }
    if items != nil && len(items) > 0 && len(allItemData) > 0 {
        //处理标题，去除标题中间空格
		titleRow := allItemData[0];
		for k,v := range titleRow {
			titleRow[k] = strings.Replace(v," ","",-1)
		}
        //增加序号列
        sq := n.findColData(&titleRow, &titleRow, SQ_COL_NAME);
        if !(sq == SQ_COL_NAME) { //不存在序号列
            titleRow = append(titleRow,SQ_COL_NAME);
            for  idx := 1; idx < len(allItemData); idx++ { //跳过标题行
                row := allItemData[idx];
                row = append(row,strconv.Itoa(idx));
            }
		}
		dt := new(DataTable)
		dt.Data = allItemData
		dt.TitelRow = titleRow
		dt.Name = items[0].Name
		return dt
    }
    return nil;
}

func (n *Nifdc) crawlYear(info NifdcConfigInfo) []DataTable{
	var results []DataTable
	
	res, err := http.Get(info.URL)
	if err != nil {
		fmt.Println(err.Error())
	} else {
		defer res.Body.Close()
		utfBody, err := charset.NewReader(res.Body, "gb18030")
		if err != nil {
			fmt.Println(err.Error())
		} else {
			doc, _ := goquery.NewDocumentFromReader(utfBody)
			var items ExtendItemSlice
            if (info.ExtendItems != nil && len(info.ExtendItems) > 0) {
				for i := 0; i < len(info.ExtendItems); i++ {
					item := info.ExtendItems[i]
					item.Name = n.getSheetName(item.Title)
				}
				items = append(items,info.ExtendItems...)
			}
			doc.Find(".ListColumnClass1 > a").Each(func(idx int, el *goquery.Selection) {
				var item NifdcConfigExtend
				href,_ := el.Attr("href")
				item.Title = el.Text()
				item.URL = info.URL + href
				item.Name = n.getSheetName(item.Title)
				items = append(items,item)
			})
			allTitle := make([]string, 0, len(items))
			gItems := make(map[string]ExtendItemSlice)
			for _, v := range items {
				if val, ok := gItems[v.Name]; ok {
					gItems[v.Name] = append(val, v)
				} else{
					gItems[v.Name] = ExtendItemSlice{v}
					allTitle = append(allTitle, v.Name)
				}
			}
			
			for _,v := range allTitle{
				dt := n.crawlItems(gItems[v])
				results = append(results,*dt)
			}
		}
	}
	return results
}

func (n *Nifdc) getSheetName(title string) string {

	lIdx := strings.LastIndex(title, "（")
	rIdx := strings.LastIndex(title, "）")
	return strings.TrimSpace(title[lIdx + len("（") : rIdx]) //（占3个字节
}

func (n *Nifdc) isSpecialCharacter(code rune) bool {
	if code <= 0x206F && code >= 0x2000 {
		return true
	}
	return false
}

//判断行是否存在数据
func (n *Nifdc) hasData(r *DataRow) bool {
	for i := range *r {
		v := (*r)[i]
		if len(v) > 0 && !n.isSpecialCharacter(rune(v[0])) {
			return true
		}
	}
	return false
}

//查找对应列数据
func (n *Nifdc) findColData(titleRow *DataRow, r *DataRow, title string) string {
	idx:= -1
	for i := range *titleRow {
		if (*titleRow)[i] == title{
			idx = i;
			break
		}
	}
    if (idx >= 0) {
        return (*r)[idx];
    }
    return "";
}

//判断是否为数据行,通过序号是否为数字进行判断
func (n *Nifdc) isDataRow(titleRow *DataRow, r *DataRow) bool{
	sq := n.findColData(titleRow, r, SQ_COL_NAME);
	_, err := strconv.Atoi(sq)
    if (err != nil) {
        return false;
    }
    return true;
}

func (n *Nifdc) buildSheet(itemData *DataTable) *xlsx.Sheet{
	sheet := new(xlsx.Sheet)
	sheet.Name = itemData.Name
	for _,r := range itemData.Data{
		row := sheet.AddRow()
		for _,c := range r{
			cell:= row.AddCell()
			cell.Value = c
		}
	}
    return sheet;
}

func (n *Nifdc) buildAllSheet(itemDatas []DataTable)  *xlsx.Sheet{
	allSheet := new(xlsx.Sheet)
	allSheet.Name = "ALL"

	allTitle := make([]string, 0, len(itemDatas[0].TitelRow))
	allTitle = append(allTitle, SHEET_NAME)
	allTitleMap := make(map[string]bool)
	for _,table := range itemDatas {
		for _,t := range table.TitelRow {
			if _, ok := allTitleMap[t]; !ok {
				allTitleMap[t] = true
				allTitle = append(allTitle, t)
			}
		}
	}

	//合并后的标题行
	allTitle = append(allTitle,AMOUNT_VALUE_COL_NAME)
	allTitle = append(allTitle,AMOUNT_UNIT_COL_NAME)
	titleRow := allSheet.AddRow()
	for _,t := range allTitle {
		c := titleRow.AddCell()
		c.Value = t
	}

	//循环itemDatas，合并数据
	for _,item := range itemDatas {
        //循环行
		for _,r := range item.Data {
			if n.isDataRow(&item.TitelRow, &r) { //仅合并数据行
				row := allSheet.AddRow()
				amount := n.findColData(&item.TitelRow, &r, AMOUNT_OLD_COL_NAME);
				//循环列
				for _,title := range allTitle {
					cell := row.AddCell()
					cell.Value = ""
					if title == SHEET_NAME { //表格名
						cell.Value = item.Name
                    } else if title == AMOUNT_OLD_COL_NAME {
							cell.Value = amount
                    } else if title == AMOUNT_VALUE_COL_NAME {
						aValue := regexp.MustCompile(`\d+`).FindAllString(amount,-1)
						if aValue != nil && len(aValue) > 0 {
							cell.Value = aValue[0] //数字
						}
                    } else if title == AMOUNT_UNIT_COL_NAME {
						aUnit := regexp.MustCompile(`\D+`).FindAllString(amount,-1)
						if aUnit != nil && len(aUnit) > 0 {
							cell.Value = aUnit[0]
						}
                    } else {
                        d := n.findColData(&item.TitelRow, &r, title);
							cell.Value = d
                    }
                }
            }
		}
	}

    return allSheet;
}

func (n *Nifdc) buildWorkbook(itemDatas []DataTable) *xlsx.File{
    workbook := xlsx.NewFile()

	allSheet := n.buildAllSheet(itemDatas);
	workbook.AppendSheet(*allSheet,allSheet.Name)
	for _,v := range itemDatas{
		sheet := n.buildSheet(&v)
		workbook.AppendSheet(*sheet,sheet.Name)
	}

    return workbook;
}

func (n *Nifdc) createYearWorkbook(info NifdcConfigInfo)  *xlsx.File{
    itemDatas := n.crawlYear(info);
    return n.buildWorkbook(itemDatas);
}

func (n *Nifdc) log(msg string){
	if n.logFunc != nil{
		n.logFunc(msg)
	}
}