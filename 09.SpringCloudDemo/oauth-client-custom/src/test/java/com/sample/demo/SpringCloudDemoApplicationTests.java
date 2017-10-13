package com.sample.demo;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.Assert;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.junit4.SpringRunner;

import java.io.IOException;

@RunWith(SpringRunner.class)
@SpringBootTest
public class SpringCloudDemoApplicationTests {

	@Test
	public void contextLoads() {
	}

	@Test
	public void testJson() throws IOException {
	    String jsonString = "{\"access_token\":\"56465b41-429d-436c-ad8d-613d476ff322\",\"token_type\":\"bearer\",\"expires_in\":25074,\"scope\":\"select\"}";
        ObjectMapper mapper = new ObjectMapper();
        JsonNode jsonNode = mapper.readValue(jsonString, JsonNode.class);
        JsonNode nullnode = jsonNode.get("error");
        Assert.assertNull(nullnode);
    }

    @Test
    public void testJsonArray() throws IOException {
        String jsonString = "[{\"a\":1},{\"b\":2}]";
        ObjectMapper mapper = new ObjectMapper();
        JsonNode jsonNode = mapper.readValue(jsonString, JsonNode.class);
        boolean isArray = jsonNode.isArray();

        Assert.assertEquals(true,isArray);
        int i =  jsonNode.get(0).get("a").asInt();
        Assert.assertEquals(1,i);
    }
}
