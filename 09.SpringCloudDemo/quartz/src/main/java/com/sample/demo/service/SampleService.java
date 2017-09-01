package com.sample.demo.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

/**
 * Created by david on 2015-01-20.
 */
@Service
public class SampleService {

    private static final Logger LOG = LoggerFactory.getLogger(SampleService.class);

    public void hello(String txt) {
        LOG.info("Hello " + txt + " !" );
    }
}
