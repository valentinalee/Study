package com.sample.demo.web;

import com.sample.demo.client.OAuthConfig;
import com.sample.demo.client.OAuthRestTemplate;
import org.apache.log4j.Logger;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;

import javax.servlet.http.HttpServletRequest;

@RestController
@RequestMapping(value = "/weixin")
public class WeiXinController {
    private final Logger logger = Logger.getLogger(getClass());

    private RestTemplate weixinRestTemplate;

    @RequestMapping(value = "/getcallbackip" ,method = RequestMethod.GET)
    public String getcallbackip(HttpServletRequest request) {
        String r = getWeixinRestTemplate().getForObject("https://api.weixin.qq.com/cgi-bin/getcallbackip", String.class);
        return r;
    }

    @RequestMapping(value = "/getuser" ,method = RequestMethod.GET)
    public String getuser(HttpServletRequest request) {
        String r = getWeixinRestTemplate().getForObject("https://api.weixin.qq.com/cgi-bin/user/get", String.class);
        return r;
    }

    private RestTemplate getWeixinRestTemplate(){
        if(weixinRestTemplate == null) {
            OAuthConfig config = new OAuthConfig();
            config.setTokenUrl("https://api.weixin.qq.com/cgi-bin/token");
            config.setCanRefresh(false);
            config.setAppId("wx122309256170e7a0");
            config.setAppSecret("c4fba09c00b7e69b62e7d00d692eda96");
            config.setAppIdName("appid");
            config.setAppSecretName("secret");
            config.setTokenName("access_token");
            config.getAdditionalParams().set("grant_type", "client_credential");
            weixinRestTemplate = new OAuthRestTemplate(config);
        }
        return weixinRestTemplate;
    }

}
