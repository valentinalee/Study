#/bin/bash
#es-index-clear
#获取上个月份日期
LAST_DATA=`date -d "last month" +%Y-%m`
#删除上个月份所有的索引
curl -XDELETE 'http://127.0.0.1:9200/logstash-'${LAST_DATA}'-*'


#crontab -e
#0 1 5 * * /opt/elk/es-index-clear.sh
