package com.example.controller;

import com.example.PahoRunner;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

/**
 * Created by lik on 2017/3/31.
 */
@RestController
@RequestMapping(value="/run")
public class RunnerController {

    @Autowired
    private PahoRunner pahoRunner;

    @RequestMapping(value = "/status", method = RequestMethod.GET)
    public String getStatus(){
        return pahoRunner.getId();
    }

    @RequestMapping(value = "/start", method = RequestMethod.GET)
    public void start(){
    }

    @RequestMapping(value = "/stop", method = RequestMethod.GET)
    public void stop(){
    }

}
