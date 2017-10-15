# nifdc-crawler说明

网络爬虫(golang版本)，抓取生物制品批签发数据,2013年以前的格式不同，暂不支持

* 2017:<http://www.nifdc.org.cn/CL0873/>
* 2016:<http://www.nifdc.org.cn/CL0833/>
  * 2016年12月1日至12月15日:<http://www.nifdc.org.cn/CL0873/9048.html>
  * 2016年12月16日至12月31日:<http://www.nifdc.org.cn/CL0873/9084.html>
* 2015:<http://www.nifdc.org.cn/CL0792/>
* 2014:<http://www.nifdc.org.cn/CL0737/>
* 2013:<http://www.nifdc.org.cn/CL0428/>
* 2012:<http://www.nifdc.org.cn/CL0621/>
* 2011:<http://www.nifdc.org.cn/CL0568/>
* 2010:<http://www.nifdc.org.cn/CL0498/>
* 2009:<http://www.nifdc.org.cn/CL0427/>
* 2008:<http://www.nifdc.org.cn/CL0233/>
* 2007:<http://www.nifdc.org.cn/CL0168/>

## walk(golang windows gui)说明

### 编译构建说明

1. 创建Manifest文件`main.manifest`如下：

```xml
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
    <assembly xmlns="urn:schemas-microsoft-com:asm.v1" manifestVersion="1.0">
        <assemblyIdentity version="1.0.0.0" processorArchitecture="*" name="SomeFunkyNameHere" type="win32"/>
        <dependency>
            <dependentAssembly>
                <assemblyIdentity type="win32" name="Microsoft.Windows.Common-Controls" version="6.0.0.0" processorArchitecture="*" publicKeyToken="6595b64144ccf1df" language="*"/>
            </dependentAssembly>
        </dependency>
    </assembly>
```

2. 使用[rsrc 工具](https://github.com/akavel/rsrc) 编译manifest文件:

```bash
  go get github.com/akavel/rsrc
  rsrc -manifest main.manifest -o rsrc.syso
```

3. 编译应用

```bash
  go build -ldflags="-H windowsgui"
```