package com.sample.demo.web;

import com.sample.demo.client.SSLOAuthClient;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Bean;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;

import javax.servlet.http.HttpServletRequest;

@RestController
@RequestMapping(value = "/test")
public class TestController {

    @Autowired
    @Qualifier("test")
    RestTemplate restTemplate;

    @RequestMapping(value = "/test" ,method = RequestMethod.GET)
    public String test(HttpServletRequest request) {
        String r = restTemplate.getForObject("https://localhost:10443/", String.class);
        return r;
    }

    @Bean
    @Qualifier("test")
    RestTemplate getRestTemplate(){
        return new SSLOAuthClient().poolRestTemplate();
//        return new RestTemplate();
    }
}
