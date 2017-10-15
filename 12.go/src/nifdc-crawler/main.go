//go:generate go-bindata -pkg main -o resources.go config.json
package main

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"os"
	"os/exec"
	"path/filepath"

	walk "github.com/lxn/walk"
	wd "github.com/lxn/walk/declarative"
)

func Exist(filename string) bool {
	_, err := os.Stat(filename)
	return err == nil || os.IsExist(err)
}

func main() {
	var dirText *walk.LineEdit
	var logText *walk.TextEdit
	var mainWin *walk.MainWindow
	var config NifdcConfig

	dlg := new(walk.FileDialog)
	dlg.Title = "选择结果保存目录"

	exeFile, _ := exec.LookPath(os.Args[0])
	exePath, _ := filepath.Abs(exeFile)

	configFilePath := exePath + ".json"

	if !Exist(configFilePath) {
		bytes, _ := Asset("config.json")
		ioutil.WriteFile(configFilePath, bytes, 0666)
	}

	data, err := ioutil.ReadFile(configFilePath)
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
		MinSize:  wd.Size{Width: 500, Height: 200},
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
					nifdc.logFunc = func(msg string) {
						fmt.Println(msg)
					}
					for _, info := range config.DataInfo {
						out_file_path := filepath.Join(dirText.Text(), info.Year+".xlsx")
						if info.Enable {
							file := nifdc.createYearWorkbook(info)
							file.Save(out_file_path)
						}
					}
					logText.SetText("运行完成！")
				},
			},
			wd.TextEdit{AssignTo: &logText},
		},
	}.Run()
}
