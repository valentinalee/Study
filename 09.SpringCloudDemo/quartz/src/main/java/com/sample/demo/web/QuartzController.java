package com.sample.demo.web;

import com.sample.demo.job.SampleJob;
import com.sample.demo.service.QuartzService;
import org.quartz.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.quartz.SchedulerFactoryBean;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashSet;
import java.util.Random;
import java.util.UUID;

import static org.quartz.CronScheduleBuilder.cronSchedule;

@RestController
public class QuartzController {
    private final Logger logger = LoggerFactory.getLogger(getClass());

    private String jobGroup = "demo-group";

    @Autowired
    QuartzService quartzService;

    @RequestMapping(value = "/run" ,method = RequestMethod.GET)
    public String run(){
        String jobName = "demo-job-" + UUID.randomUUID().toString();

        JobDataMap jobDataMap = new JobDataMap();
        jobDataMap.put("jobArg", jobName);
        JobDetail jobDetail = JobBuilder.newJob(SampleJob.class)
                .setJobData(jobDataMap)
                .withDescription("demo")
                .withIdentity(jobName, jobGroup)
                .requestRecovery() //设置此参数，在应用发生故障后可恢复
                .build();

        Trigger trigger = TriggerBuilder.newTrigger()
                .forJob(jobDetail)
                .withSchedule(SimpleScheduleBuilder.simpleSchedule().withIntervalInSeconds(5).withRepeatCount(0))
//                .withSchedule(cronSchedule("0/5 * * * * ?"))
                .build();

        quartzService.add(jobDetail,new HashSet<Trigger>(){{add(trigger);}});

        return jobName;
    }


    @RequestMapping(value = "/disableAll" ,method = RequestMethod.GET)
    public void disableAll() {
        quartzService.disableAll();
    }

    @RequestMapping(value = "/enableAll" ,method = RequestMethod.GET)
    public void enableAll() {
        quartzService.enableAll();
    }


}
