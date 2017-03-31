package com.example;

import org.eclipse.paho.client.mqttv3.MqttException;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Service;

import java.util.UUID;

/**
 * Created by lik on 2017/3/31.
 */
@Service
public class PahoRunner implements ApplicationRunner {

    private String id;

    public PahoRunner(){
        this.id = UUID.randomUUID().toString();
    }

    public String getId(){
        return this.id;
    }

    @Override
    public void run(ApplicationArguments args) throws Exception {
        System.out.println(this.id);

        boolean quietMode = false;
        String pubTopic = "test";
        String subTopic = "test";
        String message = "Message from async waiter Paho MQTTv3 Java client sample";
        int qos = 1;
        String broker = "192.168.190.130";
        int port = 1883;
        String clientId = UUID.randomUUID().toString();
        boolean cleanSession = true;            // Non durable subscriptions
        String userName = null;
        String password = null;

        String url = "tcp://" + broker + ":" + port;
        try {
            // Create an instance of this class
            PahoClient sampleClient = new PahoClient(url, clientId, cleanSession, quietMode, userName, password);

//            sampleClient.publish(pubTopic, qos, message.getBytes());

            sampleClient.subscribe(subTopic, qos);
        } catch (MqttException me) {
            // Display full details of any exception that occurs
            System.out.println("reason " + me.getReasonCode());
            System.out.println("msg " + me.getMessage());
            System.out.println("loc " + me.getLocalizedMessage());
            System.out.println("cause " + me.getCause());
            System.out.println("excep " + me);
            me.printStackTrace();
        }
    }
}
