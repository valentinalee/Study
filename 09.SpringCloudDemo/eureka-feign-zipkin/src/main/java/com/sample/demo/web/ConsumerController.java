package com.sample.demo.web;


import com.sample.demo.service.ComputeClient;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class ConsumerController {

    private final Logger logger = LogManager.getLogger(getClass());
    @Autowired
    ComputeClient computeClient;

    @RequestMapping(value = "/add", method = RequestMethod.GET)
    public Integer add() {
        logger.info("feign add, invoke compute-service");
        return computeClient.add(10, 20);
    }
}
