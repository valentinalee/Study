electron制作UI

设置环境变量

为什么要设置环境变量呢？是因为打包或运行的时候需要下载对应的二进制文件，这些二进制文件下载速度奇慢奇慢的，如果我们使用淘宝CDN的话可以把这速度提升得杠杠的。

如果你是linux用户，设置临时环境变量，直接执行
ELECTRON_MIRROR=http://npm.taobao.org/mirrors/electron/
如果你是windows用户，请依次执行: 计算机->右键->属性->高级系统设置->环境变量->在用于(或者系统)变量下点击->新建。
变量名：ELECTRON_MIRROR
变量值：http://npm.taobao.org/mirrors/electron/

npm源设置
npm config set registry https://registry.npm.taobao.org 