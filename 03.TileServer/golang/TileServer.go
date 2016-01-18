package main

import (
	"fmt"
	"log"
	"os"
	"path"
	"path/filepath"
	"io/ioutil"
	"strconv"
	"encoding/json"
	"github.com/gorilla/mux"
	"net/http"
	"html"
)

type Tile struct {
    Name string //瓦片名称，在url地址中作为路径名
    FilePath string //瓦片文件路径
	FileExt string //瓦片图片类型（扩展名）
	Type string //瓦片类型：gmap  esri
	Note string //备注
}

type TileConf struct {
    Tiles []Tile
	BlankImage string //不存在瓦片时的默认图片
	Port int //服务器端口
}

// 检查文件或目录是否存在
// 如果由 filename 指定的文件或目录存在则返回 true，否则返回 false
func Exist(filename string) bool {
    _, err := os.Stat(filename)
    return err == nil || os.IsExist(err)
}

// 字符串转int，如失败返回0
func atoi(str string) int {
	i, err := strconv.Atoi(str)
	if err == nil{
		return i
	}else{
		return 0
	}
}

func mapserver(w http.ResponseWriter,r *http.Request){
	fmt.Fprint(w, "瓦片服务的地址为：/MapServer/{name}/{z}/{y}/{x}。其中name与配置文件项名称对应。")	
}

func tileFunc(w http.ResponseWriter, r *http.Request) {
	params := mux.Vars(r)
  	name := params["name"]
	x := params["x"]
	y := params["y"]
	z := params["z"]
		
	//从配置文件中查找对应配置
	var curTileConf *Tile
	for _,v := range tc.Tiles{
		if(v.Name == name){
			curTileConf = &v
			break;
		}
	}
	if(curTileConf != nil){
		var imagePath string
		fileExt := curTileConf.FileExt
		if curTileConf.Type == "gmap" {
            imagePath = path.Join(curTileConf.FilePath, fmt.Sprintf("%s%c%s%c%s.%s",z,os.PathSeparator, x,os.PathSeparator, y,fileExt));

        }else if curTileConf.Type == "esri" {
			
            imagePath = path.Join(curTileConf.FilePath, fmt.Sprintf("L%02x%cR%08x%cC%08x.%s", atoi(z),os.PathSeparator,atoi(y),os.PathSeparator,atoi(x),fileExt));
        }
        if !Exist(imagePath){
			log.Printf("file %s not exist!",imagePath)
			imagePath = blankImagePath
            fileExt = "png"
        }
		
		imgData, err := ioutil.ReadFile(imagePath)
		if err != nil{
			w.WriteHeader(http.StatusNotFound)
		}else{
			w.Header().Set("Content-Type", fmt.Sprintf("image/%s",fileExt))
			w.Header().Set("Content-Length", strconv.Itoa(len(imgData)))
			w.Header().Set("Access-Control-Allow-Origin", "*")
			w.Header().Add("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
			w.Header().Set("Access-Control-Allow-Methods", "*")
			
			_, err := w.Write(imgData);
			if err != nil {
				fmt.Fprintf(w, "%q name:%q x:%q y:%q z:%q", html.EscapeString(r.URL.Path),name,x,y,z)
	        }
		}
	}else{
		w.WriteHeader(http.StatusNotFound)
	}
}


var tc TileConf //配置文件内容
var blankImagePath string //默认图片路径
func main() {
	//读取json配置文件
	exePath,_ := filepath.Abs(filepath.Dir(os.Args[0])) //应用程序路径
	configPath := path.Join(exePath,"conf.json") //配置文件路径
		
	confData, err := ioutil.ReadFile(configPath)
    if err != nil {
        log.Fatalln(err)
		return
    }
	json.Unmarshal(confData, &tc)
	blankImagePath = path.Join(exePath,tc.BlankImage)
	
	//映射http服务路由规则
	r := mux.NewRouter()
	r.HandleFunc("/",mapserver)
	r.HandleFunc("/MapServer",mapserver)
	r.HandleFunc("/MapServer/{name:[a-zA-Z0-9]+}/{z:[0-9]+}/{y:[0-9]+}/{x:[0-9]+}", tileFunc).Methods("GET")
	
	http.Handle("/",r)
	
	addr := fmt.Sprint(":",tc.Port)
	fmt.Printf("服务器启动地址 %s \n",addr)
	log.Fatal(http.ListenAndServe(addr, nil))
}