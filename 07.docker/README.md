1.修改docker源
新版的 Docker 使用 /etc/docker/daemon.json（Linux） 或者 %programdata%\docker\config\daemon.json（Windows） 来配置 Daemon。

请在该配置文件中加入（没有该文件的话，请先建一个）：

{
  "registry-mirrors": ["https://docker.mirrors.ustc.edu.cn"] ,
  "dns": ["208.67.220.220","208.67.220.222"]
}

{
  "registry-mirrors": ["https://registry.docker-cn.com"]
}