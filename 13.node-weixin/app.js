'use strict';
/**
 * Module dependencies.
 */
const koa = require('koa');
const route = require('koa-route');
const koaBody = require('koa-body');
const WechatAPI = require('co-wechat-api');

const port = 3000; //端口
const appid = 'wx122309256170e7a0'; //微信appid
const appsecret = 'c4fba09c00b7e69b62e7d00d692eda96'; //微信appsecret

const alertConfig = {
  templateId: 'AxVrt0iTrmZzLhoZnSyMndj-ZOMS_-Eajtf5vZcHrXo', //alert模板id
  users: ['o6KK4wprhzzOxj2hLz8kSXVuV2rc'],//需要发送的用户id
  url: '',// URL置空，则在发送后,点击模板消息会进入一个空白页面（ios）, 或无法点击（android）
  topColor: '#FF0000', // 顶部颜色
};

const app = new koa();
const wechatApi = new WechatAPI(appid, appsecret);

const weixin = {
  alert: async (ctx) => {
    let msg = ctx.request.body.msg ? ctx.request.body.msg : ctx.query.msg;
    let data = {
      first: {
        "value": '请注意！'
      },
      msg: {
        "value": msg,
        "color": "#FF0000"
      },
      time: {
        "value": (new Date()).toLocaleString()
      },
      remark: {
        "value": "请后台人员相互转告，谢谢！"
      },
    };
    let isOk = true;
    for(let userId of alertConfig.users) {
      let result = await wechatApi.sendTemplate(userId, alertConfig.templateId, alertConfig.url, alertConfig.topColor, data);
      if (result && result.errcode == 0) {
        //success
      } else {
        isOk = false;
        console.error(`send alert message(${content}) to user(${userId}) error (${result.errmsg})!`);
      }
    }

    if (isOk) {
      ctx.body = { errcode: 0, errmsg: "ok" };
    } else {
      ctx.body = { errcode: 400, errmsg: "error" };
    }
  }
};

app.use(koaBody());

const main = async ctx => {
  ctx.body = 'Hello World';
};

app.use(route.get('/', main));
app.use(route.get('/weixin/alert', weixin.alert));
app.use(route.post('/weixin/alert', weixin.alert))

app.listen(port);
console.log(`listening on port ${port}`);