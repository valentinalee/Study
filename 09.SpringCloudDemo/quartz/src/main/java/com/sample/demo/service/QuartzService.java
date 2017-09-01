package com.sample.demo.service;

import org.quartz.*;
import org.quartz.impl.matchers.GroupMatcher;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * 定时任务操作
 *
 * @author: lvhao
 * @since: 2016-6-23 19:58
 */
@Service
@Transactional
public class QuartzService {

    // SchedulerFactoryBean 创建
    @Autowired
    private Scheduler scheduler;

    // 任务列表
    @Transactional(readOnly = true)
    public List<JobDetail> queryJobList(){
        List<JobDetail> jobDetails = null;

        try {
            Set<JobKey> jobSet = scheduler.getJobKeys(GroupMatcher.anyJobGroup());
            jobDetails = jobSet.stream().map(jk ->{
                JobDetail jd = null;
                jd = this.getJobDetailByKey(jk);
                return jd;
            }).collect(Collectors.toList());
        } catch (SchedulerException e) {
            e.printStackTrace();
        }
        return jobDetails;
    }

    /**
     * 查询指定jobkey jobDetail
     * @param jobKey
     * @return
     */
    @Transactional(readOnly = true)
    public JobDetail queryByKey(JobKey jobKey){
        return this.getJobDetailByKey(jobKey);
    }

    /**
     * 添加任务
     * @param jobDetail
     */
    public boolean   add(JobDetail jobDetail,Set<? extends Trigger> triggerSet ) {
        // 如果已经存在 则替换
        try {
            scheduler.scheduleJob(jobDetail,triggerSet,true);
            return true;
        } catch (SchedulerException e) {
            e.printStackTrace();
        }
        return false;
    }

    /**
     * 删除任务
     *
     * @param jobKeyList
     */
    public boolean remove(List<JobKey> jobKeyList){
        try {
            return scheduler.deleteJobs(jobKeyList);
        } catch (SchedulerException e) {
            e.printStackTrace();
        }
        return false;
    }

    // 停用任务
    public boolean disable(GroupMatcher<JobKey> matcher){
        try {
            scheduler.pauseJobs(matcher);
            return true;
        } catch (SchedulerException e) {
            e.printStackTrace();
        }
        return false;
    }

    // 停用所有任务
    public boolean disableAll(){
        try {
            scheduler.pauseAll();
            return true;
        } catch (SchedulerException e) {
            e.printStackTrace();
        }
        return false;
    }

    // 启用任务
    public boolean enable(GroupMatcher<JobKey> matcher){
        try {
            scheduler.resumeJobs(matcher);
            return true;
        } catch (SchedulerException e) {
            e.printStackTrace();
        }
        return false;
    }

    // 启用所有任务
    public boolean enableAll(){
        try {
            scheduler.resumeAll();
            return true;
        } catch (SchedulerException e) {
            e.printStackTrace();
        }
        return false;
    }

    // 立即触发任务
    public boolean triggerNow(JobKey jobKey, JobDataMap jobDataMap){
        try {
            scheduler.triggerJob(jobKey,jobDataMap);
            return true;
        } catch (SchedulerException e) {
            e.printStackTrace();
        }
        return false;
    }

    /**
     * 根据key 获取jobDetail
     * @param jobKey
     * @return
     */
    @Transactional(readOnly = true)
    public JobDetail getJobDetailByKey(JobKey jobKey){
        JobDetail jd = null;
        try {
            jd = scheduler.getJobDetail(jobKey);
        } catch (SchedulerException e) {
            e.printStackTrace();
        }
        return jd;
    }

    /**
     * 根据key 获取job trigger
     * @param jobKey
     * @return
     */
    public List<Trigger> getTriggerByKey(JobKey jobKey){
        List<Trigger> triggerList = new ArrayList<>();
        try {
            triggerList = (List<Trigger>)scheduler.getTriggersOfJob(jobKey);
        } catch (SchedulerException e) {
            e.printStackTrace();
        }
        return triggerList;
    }
}
