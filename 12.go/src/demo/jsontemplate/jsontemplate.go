package jsontemplate

import (
	"fmt"
	"io/ioutil"

	jsoniter "github.com/json-iterator/go"
)

func Load(filename string, v interface{}) {

	data, err := ioutil.ReadFile(filename)

	if err != nil {
		panic(err)
	}
	println(string(data))

	datajson := []byte(data)

	err = jsoniter.Unmarshal(datajson, v)
	if err != nil {
		panic(err)
	}

}

func Exec() {
	var tplStruct TplStruct

	Load("header.json", &tplStruct)

	fmt.Printf("%#v\n", tplStruct)
	b, _ := jsoniter.MarshalIndent(tplStruct, "", "  ")
	println(string(b))
}
