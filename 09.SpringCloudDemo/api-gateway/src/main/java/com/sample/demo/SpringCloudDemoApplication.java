package com.sample.demo;

import com.sample.demo.filter.AccessFilter;
import org.springframework.boot.SpringApplication;
import org.springframework.cloud.client.SpringCloudApplication;
import org.springframework.cloud.netflix.zuul.EnableZuulProxy;
import org.springframework.context.annotation.Bean;

@EnableZuulProxy
@SpringCloudApplication
public class SpringCloudDemoApplication {

	public static void main(String[] args) {
		SpringApplication.run(SpringCloudDemoApplication.class, args);
	}

	@Bean
	public AccessFilter accessFilter() {
		return new AccessFilter();
	}
}
