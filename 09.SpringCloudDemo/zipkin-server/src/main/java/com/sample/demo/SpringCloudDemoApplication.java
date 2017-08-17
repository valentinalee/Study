package com.sample.demo;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.sleuth.stream.SleuthStreamAutoConfiguration;
import zipkin.server.EnableZipkinServer;

@EnableZipkinServer
@SpringBootApplication(exclude = SleuthStreamAutoConfiguration.class)
public class SpringCloudDemoApplication {

	public static void main(String[] args) {
		SpringApplication.run(SpringCloudDemoApplication.class, args);
	}
}
