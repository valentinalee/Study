package main

import (
	"encoding/json"
	"io/ioutil"
	"path/filepath"

	walk "github.com/lxn/walk"
	wd "github.com/lxn/walk/declarative"
)

func main() {
	var dirText *walk.LineEdit
	var logText *walk.ListBox
	var mainWin *walk.MainWindow
	var config NifdcConfig

	dlg := new(walk.FileDialog)
	dlg.Title = "选择结果保存目录"

	data, err := ioutil.ReadFile("config.json")
	if err != nil {
		panic(err)
	}
	datajson := []byte(data)
	err = json.Unmarshal(datajson, &config)
	if err != nil {
		panic(err)
	}

	wd.MainWindow{
		AssignTo: &mainWin,
		Title:    "生物制品批签发抓取",
		MinSize:  wd.Size{Width: 600, Height: 400},
		Layout:   wd.VBox{},
		Children: []wd.Widget{
			wd.Composite{
				Layout: wd.HBox{},
				Children: []wd.Widget{
					wd.Label{Text: "结果记录目录："},
					wd.LineEdit{AssignTo: &dirText, ReadOnly: true},
					wd.PushButton{Text: "选择",
						OnClicked: func() {

							if ok, err := dlg.ShowBrowseFolder(mainWin); err == nil && ok {
								dirText.SetText(dlg.FilePath)
							}

						}},
				},
			},
			wd.PushButton{
				Text: "确定",
				OnClicked: func() {
					nifdc := new(Nifdc)
					for _, info := range config.DataInfo {
						out_file_path := filepath.Join(dirText.Text(), info.Year+".xlsx")
						if info.Enable {
							file := nifdc.createYearWorkbook(info)
							file.Save(out_file_path)
						}
					}
				},
			},
			wd.ListBox{AssignTo: &logText},
		},
	}.Run()
}
