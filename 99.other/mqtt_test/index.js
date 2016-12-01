const mqtt = require('mqtt');

for(let i=0;i< 60000; i++){
    if(i%5000==4999){
        console.log('client :',i + 1);
    }
    let client  = mqtt.connect('mqtt://10.172.71.145',{keepalive: 120,connectTimeout: 300 * 1000});

    client.on('connect', function () {
        client.subscribe('test' + (i%1000));
        if(i % 100 == 1){
            setInterval(function() {
                client.publish('test' + Math.floor(Math.random() * 1000), (new Date()).toISOString() + ' Hello mqtt ' + Math.random());
            }, 90 * 1000);
        }
    });

    if(i < 1000){
        client.on('message', function (topic, message) {
          // message is Buffer
          console.log((new Date()).toISOString() + ' ' + topic + ' ' + message.toString());
          // client.end();
        });
    }

    client.on('error', function (error) {
      // message is Buffer
      console.log(error);
      // client.end();
    })

}