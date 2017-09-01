package com.sample.demo.job;


import com.sample.demo.service.SampleService;
import org.quartz.Job;
import org.quartz.JobExecutionContext;
import org.springframework.beans.factory.annotation.Autowired;

/**
 * Created by david on 2015-01-20.
 */
public class SampleJob implements Job {
    private String jobArg;

    @Autowired
    private SampleService service;

    @Override
    public void execute(JobExecutionContext jobExecutionContext) {
        service.hello(this.jobArg);
        try {
            Thread.sleep(60 * 1000);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
        service.hello("end " + this.jobArg);
    }

    public void setJobArg(String jobArg) {
        this.jobArg = jobArg;
    }
}
