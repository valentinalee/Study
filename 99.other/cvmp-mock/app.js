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
const url = require("url");
const validator = require('validator');
const rp = require('request-promise-native');

const port = 53080; //端口

const app = new koa();

app.use(koaBody());

const main = async ctx => {
  ctx.body = 'cvmp mock';
};

router.get('/', main)

const authRequired = async (ctx, next) => {
  let appId = ctx.header.app_key;
  let auth = ctx.header.authorization;
  let token = "";

  let authArray = _.split(auth, " ");
  if (authArray.length >= 2) {
    token = authArray[1];
  }

  if (appId == "test" && (token == "950a7cc9-5a8a-42c9-a693-40e817b1a4b0" || token == "56465b41-429d-436c-ad8d-613d476ff322")) {
    await next();
  } else {
    console.log(`app_key:${appId} auth:${auth} `);
    ctx.status = 401;
    ctx.body = {
      "error_code": 100000,
      "error_desc": "token error.",
    };
  }

}

const authRequiredProxy = async (ctx, next) => {
  let appId = ctx.header.app_key;
  let auth = ctx.header.authorization;
  let token = "";

  let authArray = _.split(auth, " ");
  if (authArray.length >= 2) {
    token = authArray[1];
  }

  if (appId && token) {
    await next();
  } else {
    console.log(`app_key:${appId} auth:${auth} `);
    ctx.status = 401;
    ctx.body = {
      "error_code": 100000,
      "error_desc": "token error.",
    };
  }

}

const proxy = async (ctx) => {
  let options = {
    "rejectUnauthorized": false,
    resolveWithFullResponse: true,
    method: ctx.method,
    uri: 'https://117.78.60.188:8743' + ctx.url,
    qs:ctx.query,
    json: true,
  };
  if(ctx.request.type == "application/x-www-form-urlencoded"){
    options.form = ctx.request.body;
  }else{
    options.body = ctx.request.body;
  }
  const response = await rp(options);
  ctx.body = response.body;
  ctx.status = response.statusCode;
}


// router.use('/api', authRequired);
router.use('/api', authRequiredProxy);

// 1.1.1 Authentication
// router.post('/iocm/app/sec/v1.1.0/login', async (ctx) => {
//   let appId = ctx.request.body.appId;
//   let secret = ctx.request.body.secret;
//   if ((appId == "test") && (secret == "test")) {
//     ctx.body = {
//       "accessToken": "950a7cc9-5a8a-42c9-a693-40e817b1a4b0",
//       "tokenType": "bearer",
//       "expiresIn": 7200,
//       "refreshToken": "773a0fcd-6023-45f8-8848-e141296cb3cb",
//       "scope": "default",
//     };
//   } else {
//     ctx.status = 401;
//     ctx.body = {
//       "error_code": 100208,
//       "error_desc": "AppId or secret is not right.",
//     };
//   }
// })
router.post('/iocm/app/sec/v1.1.0/login', async (ctx) => {
  await proxy(ctx);
})

// 1.1.2 Token Refreshing
// router.post('/iocm/app/sec/v1.1.0/refreshToken', async (ctx) => {
//   let token = ctx.request.body;
//   if (token.appId == "test" && token.secret == "test") {
//     if (token.refreshToken == "773a0fcd-6023-45f8-8848-e141296cb3cb") {
//       ctx.body = {
//         "accessToken": "56465b41-429d-436c-ad8d-613d476ff322",
//         "tokenType": "bearer",
//         "expiresIn": 7200,
//         "refreshToken": "773a0fcd-6023-45f8-8848-e141296cb3cb",
//         "scope": "default",
//       };
//     } else {
//       ctx.status = 401;
//       ctx.body = {
//         "error_code": 100006,
//         "error_desc": "Refresh access token failed.",
//       };
//     }
//   } else {
//     ctx.status = 401;
//     ctx.body = {
//       "error_code": 100208,
//       "error_desc": "AppId or secret is not right.",
//     };
//   }
// })
router.post('/iocm/app/sec/v1.1.0/refreshToken', async (ctx) => {
  await proxy(ctx);
})

// 1.2.1 Common Events Subscription
router.post('/api/vehicle/v1.0/subscriptions', async (ctx) => {
  let body = ctx.request.body;
  let callbackUrl = body.callbackUrl;
  if (validator.isURL(callbackUrl)) {
    body.subscriptionId = uuidv4();
    ctx.status = 201;
    ctx.body = body;
  } else {
    ctx.status = 400;
    ctx.body = {
      "error_code": 100222,
      "error_desc": "The request callbackurl is illegal.",
    };
  }
})

// 1.2.4 Commands Sending
router.post('/api/vehicle/v1.0/commands', async (ctx) => {
  let body = ctx.request.body;
  let command = body.command;
  if (command) {
    if (command.method) {
      if (command.vin) {
        ctx.status = 200;
        ctx.body = { requestId: uuidv4() };
      } else {
        ctx.body = {
          "error_code": 100428,
          "error_desc": "The device is not online.",
        };
      }
    } else {
      ctx.status = 400;
      ctx.body = {
        "error_code": 102203,
        "error_desc": "Command name is invalid.",
      };
    }
  } else {
    ctx.status = 400;
    ctx.body = {
      "error_code": 100222,
      "error_desc": "The input is invalid.",
    };
  }
})

// 1.3.2 Call Center Close xCall
router.put('/api/vehicle/v1.0/xcalls/:caseId', async (ctx) => {
  let caseId = ctx.params.caseId;
  let body = ctx.request.body;
  if (caseId) {
    if (_.eq(body.status, "close")) {
      ctx.status = 200;
      ctx.body = { caseId: caseId, status: body.status };
    } else {
      ctx.status = 400;
      ctx.body = {
        "error_code": 100022,
        "error_desc": "The input is invalid.",
      };
    }
  } else {
    ctx.status = 400;
    ctx.body = {
      "error_code": "100xxx",
      "error_desc": "The xcall is not existed.",
    };
  }
})

// 1.3.3 Query ecall/bcall Reporting 
router.get('/api/vehicle/v1.0/xcalls', async (ctx) => {
  let vin = ctx.query.vin;
  let caseId = ctx.query.caseId;
  if (vin || caseId) {
    ctx.body = {
      "xcallInfos": [
        {
          "caseId": caseId ? caseId : "xxxx",
          "eventType": "eCallReport ",
          "timestamp": "xxxxxxxxxx",
          "eventTime": "xxxxxxxxxxxxxx",
          "vin": vin ? vin : "xxxxxxxxxxxxxx",
          "data": {
            "serviceType": "ecall",
            "messageType": "create",
            "callCenterName": "DSSP",
            "callCenterCreator": "Admin",
            "callCenterUrl": "http://www.huawei.com",
            "htime": "2017-09-07T08:08:35Z",
            "otime": "2017-09-07T08:08:38Z",
            "ptime": "2017-09-07T08:08:39Z",
            "manual": null,
            "veh": {
              "vis": "34567890",
              "make": "Peugeot",
              "model": "",
              "body": "",
              "color": "",
              "mdate": "2017-09-14",
              "ddate": "2017-09-14",
              "hwver": "v0.0",
              "swver": "v0.0",
              "lang": "nglais",
              "energy": "",
            },
            "geo": {
              "url": "xxx",
              "head": {
                "est": 17,
                "value": 54
              },
              "raw": {
                "x": 1234,
                "y": 3234,
                "z": 0,
                "est": 48
              },
              "p1": {
                "x": 111,
                "y": 11
              },
              "p2": {
                "x": 222,
                "y": 22
              },
              "p3": {
                "x": 333,
                "y": 33
              },
              "p4": {
                "x": 444,
                "y": 44
              },
              "p5": {
                "x": 555,
                "y": 55
              },
              "p6": {
                "x": 666,
                "y": 66
              },
              "p7": {
                "x": 777,
                "y": 77
              },
              "p8": {
                "x": 888,
                "y": 88
              },
              "p9": {
                "x": 999,
                "y": 99
              },
              "unit": "WGS84",
              "sats": 59
            },
            "status": {
              "rolled": null,
              "airbag": null,
              "crash": null,
              "tow": null,
              "theft": null,
              "engine": null,
              "noignition": null,
              "moving": "",
              "front": null,
              "rear": null,
              "side": null,
              "inCar": null,
              "passengers": 3,
              "deccel": null,
              "urlPhoto": null
            },
            "diag": null,
            "pfid": "5b24e",
            "caller": "44444444",
            "voice": "22855",
            "ccid": null
          }
        }
      ]
    };
  } else {
    ctx.status = 400;
    ctx.body = {
      "error_code": 100022,
      "error_desc": "The input is invalid.",
    };
  }
})

//1.4
let elementaryServices = [];

// 1.4.1 Create Elementary Services 
router.post('/api/vehicle/v1.0/elementaryServices', async (ctx) => {
  let body = ctx.request.body;
  let services = body.elementaryServices;
  if (services && _.isArray(services)) {
    _.forEach(services, function (v) {
      if (!v.elemServiceId) {
        v.elemServiceId = uuidv4();
      }
    });
    elementaryServices = _.concat(elementaryServices, services);
    ctx.status = 201;
    ctx.body = { elementaryServices: services };
  } else {
    ctx.status = 400;
    ctx.body = {
      "error_code": 100022,
      "error_desc": "The input is invalid.",
    };
  }
})

// 1.4.2 Delete Elementary Service 
router.delete('/api/vehicle/v1.0/elementaryServices/:elemServiceId', async (ctx) => {
  let elemServiceId = ctx.params.elemServiceId;
  if (elemServiceId) {
    let idx = _.findIndex(elementaryServices, function (o) { return _.eq(o.elemServiceId, elemServiceId); });
    if (idx >= 0) {
      _.pullAt(elementaryServices, idx);
      ctx.status = 204;
    } else {
      ctx.status = 400;
      ctx.body = {
        "error_code": "100xxx",
        "error_desc": "The elementary service is not existed",
      };
    }
  } else {
    ctx.status = 400;
    ctx.body = {
      "error_code": 100022,
      "error_desc": "The input is invalid.",
    };
  }
})

// 1.4.3 Update an Elementary Service 
router.put('/api/vehicle/v1.0/elementaryServices/:elemServiceId', async (ctx) => {
  let elemServiceId = ctx.params.elemServiceId;
  let body = ctx.request.body;
  if (elemServiceId) {
    let idx = _.findIndex(elementaryServices, function (o) { return _.eq(o.elemServiceId, elemServiceId); });
    if (idx >= 0) {
      delete body.elemServiceId;
      _.assignIn(elementaryServices[idx], body);
      ctx.body = elementaryServices[idx];
    } else {
      ctx.status = 400;
      ctx.body = {
        "error_code": "100xxx",
        "error_desc": "The elementary service is not existed",
      };
    }
  } else {
    ctx.status = 400;
    ctx.body = {
      "error_code": 100022,
      "error_desc": "The input is invalid.",
    };
  }
})

// 1.4.4 Query an Elementary Service 
router.get('/api/vehicle/v1.0/elementaryServices/:elemServiceId', async (ctx) => {
  let elemServiceId = ctx.params.elemServiceId;
  if (elemServiceId) {
    let idx = _.findIndex(elementaryServices, function (o) { return _.eq(o.elemServiceId, elemServiceId); });
    if (idx >= 0) {
      ctx.body = elementaryServices[idx];
    } else {
      ctx.status = 400;
      ctx.body = {
        "error_code": "100xxx",
        "error_desc": "The elementary service is not existed",
      };
    }
  } else {
    ctx.status = 400;
    ctx.body = {
      "error_code": 100022,
      "error_desc": "The input is invalid.",
    };
  }
})

// 1.4.5 Query all Elementary Services 
router.get('/api/vehicle/v1.0/elementaryServices', async (ctx) => {
  let pageNo = parseInt(ctx.query.pageNo);
  let pageSize = parseInt(ctx.query.pageSize);
  if (_.isNaN(pageNo)) {
    pageNo = 0;
  }
  if (_.isNaN(pageSize)) {
    pageSize = 1;
  }
  if (_.isNumber(pageNo) && pageNo >= 0 && _.isNumber(pageSize) && pageSize > 0) {
    let ls = _.slice(elementaryServices, pageNo * pageSize, (pageNo + 1) * pageSize);
    ctx.body = {
      totalCount: elementaryServices.length,
      pageNo: pageNo,
      pageSize: pageSize,
      elementaryServices: ls
    };
  } else {
    ctx.status = 400;
    ctx.body = {
      "error_code": 100022,
      "error_desc": "The input is invalid.",
    };
  }
})

// 1.4.6 Vehicle Services Query
router.get('/api/vehicle/v1.0/vehicles/:vin/elementaryServices', async (ctx) => {
  let vin = ctx.params.vin;
  let status = ctx.query.status;
  if (vin) {
    ctx.body = {
      "vin": vin,
      "vehicleServices": [{
        "deviceType": "NAC",
        "activatedServices": [
          {
            "elemServiceId": "aaaaaaaaaa",
            "servElemVersion": "v1.0",
            "servElemLabel": "desc"
          },
          {
            "elemServiceId": "bbbbbbbbbb",
            "servElemVersion": "v1.0",
            "servElemLabel": "desc"
          }],
        "currentEligibleService":
        {
          "deviceSoftwareVersion": "",
          "deviceFirmwareVersion": "",
          "elementaryServices": [
            {
              "elemServiceId": "cccccccccc",
              "servElemVersion": "v1.0",
              "servElemLabel": "desc"
            },
            {
              "elemServiceId": "dddddddddd",
              "servElemVersion": "v1.0",
              "servElemLabel": "desc"
            }]
        },
        "futureVersionServices": [
          {
            "elemServiceId": "eeeeeeeeee",
            "servElemVersion": "v1.0",
            "servElemLabel": "desc",
            "requiredDeviceSoftwareVersion": "v1.0",
            "requiredDeviceFirmwareVersion": "v1.0"
          },
          {
            "elemServiceId": "ffffffffff",
            "servElemVersion": "v1.0",
            "servElemLabel": "desc",
            "requiredDeviceSoftwareVersion": "v1.0",
            "requiredDeviceFirmwareVersion": "v1.0"
          }]
      }, {
        "deviceType": "ATB",
        "activatedServices": [
          {
            "elemServiceId": "aaaaaaaaaa",
            "servElemVersion": "v1.0",
            "servElemLabel": "desc"
          },
          {
            "elemServiceId": "bbbbbbbbbb",
            "servElemVersion": "v1.0",
            "servElemLabel": "desc"
          }],
        "currentEligibleService":
        {
          "deviceSoftwareVersion": "",
          "deviceFirmwareVersion": "",
          "elementaryServices": [
            {
              "elemServiceId": "cccccccccc",
              "servElemVersion": "v1.0",
              "servElemLabel": "desc"
            },
            {
              "elemServiceId": "dddddddddd",
              "servElemVersion": "v1.0",
              "servElemLabel": "desc"
            }]
        },
        "futureVersionServices": [
          {
            "elemServiceId": "eeeeeeeeee",
            "servElemVersion": "v1.0",
            "servElemLabel": "desc",
            "requiredDeviceSoftwareVersion": "v1.0",
            "requiredDeviceFirmwareVersion": "v1.0"
          },
          {
            "elemServiceId": "ffffffffff",
            "servElemVersion": "v1.0",
            "servElemLabel": "desc",
            "requiredDeviceSoftwareVersion": "v1.0",
            "requiredDeviceFirmwareVersion": "v1.0"
          }]
      }
      ]

    };
  } else {
    ctx.status = 400;
    ctx.body = {
      "error_code": "100xxx",
      "error_desc": "The VIN is not existed.",
    };
  }
})

// 1.4.7 Service Activation/Deactivation
// router.put('/api/vehicle/v1.0/vehicles/elementaryServices', async (ctx) => {
//   let body = ctx.request.body.root;
//   let vin = body.vin;
//   let requestId = body.requestId;
//   if (body.businessServices) {
//     if (vin) {
//       requestId = requestId ? requestId : uuidv4();
//       ctx.status = 200;
//       ctx.body = {requestId: requestId };
//     } else {
//       ctx.status = 400;
//       ctx.body = {
//         "error_code": "100xxx",
//         "error_desc": "The VIN is not existed.",
//       };
//     }
//   } else {
//     ctx.status = 400;
//     ctx.body = {
//       "error_code": 100022,
//       "error_desc": "The input is invalid.",
//     };
//   }
// })
router.put('/api/vehicle/v1.0/vehicles/elementaryServices', async (ctx) => {
  await proxy(ctx);
})

// 1.5.2 Vehicle Basic Information Query
router.get('/api/vehicle/v1.0/vehicles/:vin/genericConfigurations', async (ctx) => {
  let vin = ctx.params.vin;
  if (vin) {
    ctx.body = {
      "vin": vin,
      "imei": "350000000000084",
      "imsi": "S20800000000084",
      "msisdn": "33669000000",
      "iccid": "8935201641000000084",
      "uins":
      [
        {
          "uin": "0C000356541039000084",
          "deviceType": "ATB",
          "swVersion": "xxxx",
          "hwVersion": "xxxx",
          "brand":"xxxx",
          "name":"xxxx",
          "atbType":"xxxx",
          "remark":"xxxx",
        },
        {
          "uin": "0C000356541039000085",
          "deviceType": "NAC",
          "swVersion": "xxxx",
          "hwVersion": "xxxx",
          "brand":"xxxx",
          "name":"xxxx",
          "atbType":"xxxx",
          "remark":"xxxx",
        }
      ]
    };
  } else {
    ctx.status = 400;
    ctx.body = {
      "error_code": "100xxx",
      "error_desc": "The VIN is not existed.",
    };
  }
})

// 1.5.3 Query of Device VIN Conflict History
router.get('/api/vehicle/v1.0/vehicles/:vin/events', async (ctx) => {
  let vin = ctx.params.vin;
  let eventType = ctx.query.eventType;
  if (vin) {
    ctx.body = {
      "deviceDataHistorys":
      [
        {
          "vin": vin,
          "eventId": "xxxxxxxxxxx",
          "eventType": "ATBReplacement",
          "data": {},
          "timestamp": "20171212T121212Z"
        },
        {
          "vin": vin,
          "eventId": "xxxxxxxxxxx",
          "eventType": "ATBReplacement",

          "data": {},
          "timestamp": "20171212T121212Z"
        }
      ]
    };
  } else {
    ctx.status = 400;
    ctx.body = {
      "error_code": "100xxx",
      "error_desc": "The VIN is not existed.",
    };
  }
})

// 1.6.1 Wi-Fi Information Modification
router.put('/api/vehicle/v1.0/configurations/wifi', async (ctx) => {
  let body = ctx.request.body;
  let vin = body.vin;
  let callbackUrl = body.callBackUrl;
  if (validator.isURL(callbackUrl)) {
    if (vin) {
      ctx.status = 200;
      ctx.body = {};
    } else {
      ctx.status = 400;
      ctx.body = {
        "error_code": "100xxx",
        "error_desc": "The VIN is not existed.",
      };
    }
  } else {
    ctx.status = 400;
    ctx.body = {
      "error_code": 100022,
      "error_desc": "The request callbackurl is illegal.",
    };
  }
})

// 1.6.3 Wi-Fi Information Query
router.get('/api/vehicle/v1.0/configurations/wifi', async (ctx) => {
  let vin = ctx.query.vin;
  if (vin) {
    ctx.body = {
      "wifiSsid": "myWifi",
      "wifiPassword": "mypwd"
    };
  } else {
    ctx.status = 400;
    ctx.body = {
      "error_code": "100xxx",
      "error_desc": "The VIN is not existed.",
    };
  }
})

//1.7
let geoFences = [];

// 1.7.1 Create a Geo-Fence  
router.post('/api/vehicle/v1.0/geoFences', async (ctx) => {
  let body = ctx.request.body;
  let vin = body.vin;
  if (vin) {
    body.geofenceId = uuidv4();
    geoFences = _.concat(geoFences, body);
    let result = _.clone(body);
    result.requestId = uuidv4();
    ctx.status = 201;
    ctx.body = result;
  } else {
    ctx.status = 400;
    ctx.body = {
      "error_code": "100xxx",
      "error_desc": "The VIN is not existed.",
    };
  }
})

// 1.7.2 Delete a Geo-Fence 
router.delete('/api/vehicle/v1.0/geoFences/:geofenceId', async (ctx) => {
  let geofenceId = ctx.params.geofenceId;
  if (geofenceId) {
    let idx = _.findIndex(geoFences, function (o) { return _.eq(o.geofenceId, geofenceId); });
    if (idx >= 0) {
      _.pullAt(geoFences, idx);
      ctx.status = 204;
    } else {
      ctx.status = 400;
      ctx.body = {
        "error_code": "100xxx",
        "error_desc": "The geofence is not existed.",
      };
    }
  } else {
    ctx.status = 400;
    ctx.body = {
      "error_code": 100022,
      "error_desc": "The input is invalid.",
    };
  }
})

// 1.7.3 Update a Geo-Fence 
router.put('/api/vehicle/v1.0/geoFences/:geofenceId', async (ctx) => {
  let geofenceId = ctx.params.geofenceId;
  let body = ctx.request.body;
  if (geofenceId) {
    let idx = _.findIndex(geoFences, function (o) { return _.eq(o.geofenceId, geofenceId); });
    if (idx >= 0) {
      delete body.geofenceId;
      _.assignIn(geoFences[idx], body);
      ctx.body = geoFences[idx];
    } else {
      ctx.status = 400;
      ctx.body = {
        "error_code": "100xxx",
        "error_desc": "The geofence is not existed.",
      };
    }
  } else {
    ctx.status = 400;
    ctx.body = {
      "error_code": 100022,
      "error_desc": "The input is invalid.",
    };
  }
})

// 1.7.4 Query a Geo-Fence 
router.get('/api/vehicle/v1.0/geoFences/:geofenceId', async (ctx) => {
  let geofenceId = ctx.params.geofenceId;
  if (geofenceId) {
    let idx = _.findIndex(geoFences, function (o) { return _.eq(o.geofenceId, geofenceId); });
    if (idx >= 0) {
      ctx.body = geoFences[idx];
    } else {
      ctx.status = 400;
      ctx.body = {
        "error_code": "100xxx",
        "error_desc": "The geofence is not existed.",
      };
    }
  } else {
    ctx.status = 400;
    ctx.body = {
      "error_code": 100022,
      "error_desc": "The input is invalid.",
    };
  }
})

// 1.7.5 Query all Geo-fences
router.get('/api/vehicle/v1.0/geoFences', async (ctx) => {
  let vin = ctx.query.vin;
  let pageNo = parseInt(ctx.query.pageNo);
  let pageSize = parseInt(ctx.query.pageSize);
  if (_.isNaN(pageNo)) {
    pageNo = 0;
  }
  if (_.isNaN(pageSize)) {
    pageSize = 1;
  }
  if (vin && _.isNumber(pageNo) && pageNo >= 0 && _.isNumber(pageSize) && pageSize > 0) {
    let all = _.filter(geoFences, ['vin', vin]);
    let ls = _.slice(all, pageNo * pageSize, (pageNo + 1) * pageSize);
    ctx.body = {
      totalCount: all.length,
      pageNo: pageNo,
      pageSize: pageSize,
      geofences: ls
    };
  } else {
    ctx.status = 400;
    ctx.body = {
      "error_code": 100022,
      "error_desc": "The input is invalid.",
    };
  }
})


// 数据套件
// 3.1.1 位置快照查询
router.get('/api/vehicle/v1.0/vehicles/:vin/serviceDatas/latest/positions', async (ctx) => {
  let vin = ctx.params.vin;
  let tString = moment().format("YYYYMMDDTHHmmss\\Z");
  ctx.body = {
    "vin": vin,
    "position": {
      "longitude": "121.494638",
      "latitude": "31.29413",
    },
    "timestamp": tString,
  };
})

// 3.1.2 车况快照查询
router.get('/api/vehicle/v1.0/vehicles/:vin/serviceDatas/latest/vehicleStates', async (ctx) => {
  let vin = ctx.params.vin;
  ctx.body = {
    "vin": vin,
    "state": {
      "totalMileage": 33255,
      "autonomyMileage": 332,
      "mileageBeforeMaintenance": 332,
      "daysBeforeMaintenance": 33,
      "engineWaterTemperature": 80,
      "engineOilTemperature": 80,
      "engineOilLevel": 80,
      "fuelLevel": 80,
      "totalVolumefuelConsumed": 80,
      "eachVolumefuelConsumed": 80,
      "jDAAlerts": "xxxxx",
      "vehicleState": 0,
      "engineState": {
        "state": 0,
        "stateHY": null,
      },
      "networkUsed": 80,
      "rSSI": -80,
      "satelliteNumber": 80,
      "backupBatteryLevel": 80,
      "cANMessage": {
        "canFrameId": 0,
        "period": 0,
        "offset": 0,
        "bitsToRead": 0,
        "value": 0,
      },
      "instantVehicleSpeed": 80,
    },
  };
})

// 3.1.3 车况报告查询
router.get('/api/vehicle/v1.0/vehicles/:vin/serviceDatas/reports/vehicleState', async (ctx) => {
  let vin = ctx.params.vin;
  let type = ctx.query.type;
  let date = ctx.query.date;
  ctx.body = {
    "vin": vin,
    "report": {
      "totalMileage": 16777214,
      "levelOfEngineOil": 123,
      "levelOfFuel": 432,
      "mileageBeforeMaintenance": 643,
    }
  };
})

// 3.1.4 历史轨迹查询
router.get('/api/vehicle/v1.0/vehicles/:vin/serviceDatas/history/positions', async (ctx) => {
  let vin = ctx.params.vin;
  let pageNo = parseInt(ctx.query.pageNo);
  let pageSize = parseInt(ctx.query.pageSize);
  let startTime = ctx.query.startTime;
  let endTime = ctx.query.endTime;
  ctx.body = {
    "vin": vin,
    "totalCount": 2,
    "pageNo": 0,
    "pageSize": 20,
    "positionInfos":
    [
      {
        "position ":
        {
          "longitude ": "648000000",
          "latitude ": "648000000"
        },
        "timestamp": "20151212T121212Z "
      },

      {
        "position ":
        {
          "longitude ": "648000000",
          "latitude ": "648000000"
        },
        "timestamp": "20151212T121212Z "
      },
    ]
  };
})

// 3.1.5 保养信息查询
router.get('/api/vehicle/v1.0/vehicles/:vin/serviceDatas/history/maintenances', async (ctx) => {
  let vin = ctx.params.vin;
  ctx.body = {
    "vin": vin,
    "maintenance": {},
    "selfDiag": {},
  };
})

// 3.1.6 驾驶行为评分查询
router.get('/api/vehicle/v1.0/vehicles/:vin/analysisDatas/scores/drivingBehaviors/trips/:tripId', async (ctx) => {
  let vin = ctx.params.vin;
  let tripId = ctx.params.tripId;
  ctx.body = {
    "vin": vin,
    "tripId": tripId,
    "scores ": "95.66",
    "data": {}
  };
})

// 3.1.7 驾驶行为报告查询
router.get('/api/vehicle/v1.0/vehicles/:vin/analysisDatas/reports/drivingBehavior', async (ctx) => {
  let vin = ctx.params.vin;
  let type = ctx.query.type;
  let date = ctx.query.date;
  ctx.body = {
    "vin": vin,
    "report": {}
  };
})

// 3.1.8 里程油耗排名查询
router.get('/api/vehicle/v1.0/vehicles/:vin/analysisDatas/ranking/fuelConsumptions', async (ctx) => {
  let vin = ctx.params.vin;
  let type = ctx.query.type;
  let date = ctx.query.date;
  ctx.body = {
    "vin": vin,
    "ranking": {"mileage": "80.68%",
		"fuel": "85.68%"
}
  };
})

// 3.1.9 环保驾驶报告查询
router.get('/api/vehicle/v1.0/vehicles/:vin/analysisDatas/reports/ecoDrivings', async (ctx) => {
  let vin = ctx.params.vin;
  let type = ctx.query.type;
  let date = ctx.query.date;
  ctx.body = {
    "vin": vin,
    "ecoDriving": {}
  };
})

const logger = async (ctx, next) => {
  console.log(`${(new Date()).toJSON()} ${ctx.request.method} ${ctx.request.url}`);
  await next();
}


app.use(logger);
app.use(router.routes());
app.listen(port);
console.log(`listening on port ${port}`);