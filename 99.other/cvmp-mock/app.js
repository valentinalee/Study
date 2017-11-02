'use strict';
/**
 * Module dependencies.
 */
const koa = require('koa');
const router = require('koa-router')();
const koaBody = require('koa-body');
const moment = require('moment');
const _ = require('lodash');
const uuidv4 = require('uuid/v4');

const port = 53080; //端口

const app = new koa();

app.use(koaBody());

const main = async ctx => {
  ctx.body = 'cvmp mock';
};

router.get('/', main)

const authRequired = (ctx, next) => {
  let appId = ctx.header.app_key;
  let auth = ctx.header.authorization;
  let token = "";

  let authArray = _.split(auth, " ");
  if (authArray.length >= 2) {
    token = authArray[1];
  }

  if (appId == "test" && (token == "950a7cc9-5a8a-42c9-a693-40e817b1a4b0" || token == "56465b41-429d-436c-ad8d-613d476ff322")) {
    next();
  } else {
    console.log(`app_key:${appId} auth:${auth} `);
    ctx.status = 401;
    ctx.body = {
      "error_code": 100000,
      "error_desc": "token error.",
    };
  }
  
}

router.use('/api', authRequired);

// 1.1.1
router.post('/iocm/app/sec/v1.1.0/login', async (ctx) => {
  let appId = ctx.request.body.appId;
  let secret = ctx.request.body.secret;
  if ((appId == "test") && (secret == "test")) {
    ctx.body = {
      "accessToken":  "950a7cc9-5a8a-42c9-a693-40e817b1a4b0",
      "tokenType":    "bearer",
      "expiresIn":    7200,
      "refreshToken": "773a0fcd-6023-45f8-8848-e141296cb3cb",
      "scope":        "default",
    };
  } else {
    ctx.status = 401;
    ctx.body = {
      "error_code": 100208,
      "error_desc": "AppId or secret is not right.",
    };
  }
})

// 1.1.2
router.post('/iocm/app/sec/v1.1.0/refreshToken', async (ctx) => {
  let token = ctx.request.body;
  if (token.appId == "test" && token.secret == "test") {
    if (token.refreshToken == "773a0fcd-6023-45f8-8848-e141296cb3cb") {
      ctx.body = {
        "accessToken":  "56465b41-429d-436c-ad8d-613d476ff322",
        "tokenType":    "bearer",
        "expiresIn":    7200,
        "refreshToken": "773a0fcd-6023-45f8-8848-e141296cb3cb",
        "scope":        "default",
      };
    } else {
      ctx.status = 401;
      ctx.body = {
        "error_code": 100006,
        "error_desc": "Refresh access token failed.",
      };
    }
  } else {
    ctx.status = 401;
    ctx.body = {
      "error_code": 100208,
      "error_desc": "AppId or secret is not right.",
    };
  }
})

// 1.2.1
router.post('/api/vehicle/v1.0/subscriptions', async (ctx) => {
  let body = ctx.request.body;
  body.subscriptionId = uuidv4();
  ctx.status = 201;
  ctx.body = body;
})

// 数据套件
// 3.1.1
router.get('/api/vehicle/v1.0/vehicles/:vin/serviceDatas/latest/positions', async (ctx) => {
  let vin = ctx.params.vin;
  let tString = moment().format("YYYYMMDDTHHmmss\\Z");
  ctx.body = {
    "vin": vin,
    "position": {
      "longitude": "121.494638",
      "latitude":  "31.29413",
    },
    "timestamp": tString,
  };
})

// 3.1.2
router.get('/api/vehicle/v1.0/vehicles/:vin/serviceDatas/latest/vehicleStates', async (ctx) => {
  let vin = ctx.params.vin;
  ctx.body = {
    "vin": vin,
    "state": {
      "totalMileage":             33255,
      "autonomyMileage":          332,
      "mileageBeforeMaintenance": 332,
      "daysBeforeMaintenance":    33,
      "engineWaterTemperature":   80,
      "engineOilTemperature":     80,
      "engineOilLevel":           80,
      "fuelLevel":                80,
      "totalVolumefuelConsumed":  80,
      "eachVolumefuelConsumed":   80,
      "jDAAlerts":                "xxxxx",
      "vehicleState":             0,
      "engineState": {
        "state":   0,
        "stateHY": nil,
      },
      "networkUsed":        80,
      "rSSI":               -80,
      "satelliteNumber":    80,
      "backupBatteryLevel": 80,
      "cANMessage": {
        "canFrameId": 0,
        "period":     0,
        "offset":     0,
        "bitsToRead": 0,
        "value":      0,
      },
      "instantVehicleSpeed": 80,
    },
  };
})

const logger = (ctx, next) => {
  console.log(`${(new Date()).toJSON()} ${ctx.request.method} ${ctx.request.url}`);
  next();
}


app.use(logger);
app.use(router.routes());
app.listen(port);
console.log(`listening on port ${port}`);