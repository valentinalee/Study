package cn.chinaunicom;

import cn.chinaunicom.service.BlogProperties;
import org.junit.Assert;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.junit4.SpringRunner;

@RunWith(SpringRunner.class)
@SpringBootTest(classes = SpringBootDemoApplication.class)
public class SpringBootDemoTests {

    @Autowired
    private BlogProperties blogProperties;
    @Test
    public void getBlogProperties() throws Exception {
        Assert.assertEquals(blogProperties.getName(), "程序猿");
        Assert.assertEquals(blogProperties.getTitle(), "Spring Boot教程");
    }

}
