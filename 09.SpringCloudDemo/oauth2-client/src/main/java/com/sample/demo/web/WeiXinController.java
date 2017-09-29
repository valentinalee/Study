package com.sample.demo.web;

import org.apache.log4j.Logger;
import org.springframework.http.HttpHeaders;
import org.springframework.http.converter.HttpMessageConverter;
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;
import org.springframework.security.oauth2.client.DefaultOAuth2ClientContext;
import org.springframework.security.oauth2.client.OAuth2RestTemplate;
import org.springframework.security.oauth2.client.resource.OAuth2ProtectedResourceDetails;
import org.springframework.security.oauth2.client.token.AccessTokenRequest;
import org.springframework.security.oauth2.client.token.RequestEnhancer;
import org.springframework.security.oauth2.client.token.grant.client.ClientCredentialsAccessTokenProvider;
import org.springframework.security.oauth2.client.token.grant.client.ClientCredentialsResourceDetails;
import org.springframework.security.oauth2.common.AuthenticationScheme;
import org.springframework.util.MultiValueMap;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpServletRequest;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping(value = "/weixin")
public class WeiXinController {
    private final Logger logger = Logger.getLogger(getClass());

    private OAuth2RestTemplate weixinRestTemplate;

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

    private OAuth2RestTemplate getWeixinRestTemplate(){
        if(weixinRestTemplate == null) {
//        ResourceOwnerPasswordResourceDetails resourceDetails = new ResourceOwnerPasswordResourceDetails();
            ClientCredentialsResourceDetails resourceDetails = new ClientCredentialsResourceDetails();
            resourceDetails.setAccessTokenUri("https://api.weixin.qq.com/cgi-bin/token");
            resourceDetails.setClientId("wx122309256170e7a0");
            resourceDetails.setClientSecret("c4fba09c00b7e69b62e7d00d692eda96");
            resourceDetails.setGrantType("client_credential");
            resourceDetails.setAuthenticationScheme(AuthenticationScheme.form);

            DefaultOAuth2ClientContext clientContext = new DefaultOAuth2ClientContext();

            weixinRestTemplate = new OAuth2RestTemplate(resourceDetails, clientContext);
            weixinRestTemplate.setAccessTokenProvider(new WeixinClientCredentialsAccessTokenProvider());
            weixinRestTemplate.setRetryBadAccessTokens(true);
        }
        return weixinRestTemplate;
    }

    class WeixinClientCredentialsAccessTokenProvider extends ClientCredentialsAccessTokenProvider {

        public WeixinClientCredentialsAccessTokenProvider() {
            List<HttpMessageConverter<?>> converters = new ArrayList<HttpMessageConverter<?>>();
            converters.add(new MappingJackson2HttpMessageConverter());
            this.setMessageConverters(converters);
            this.setTokenRequestEnhancer(new RequestEnhancer() {
                @Override
                public void enhance(AccessTokenRequest request, OAuth2ProtectedResourceDetails resource,
                                    MultiValueMap<String, String> form, HttpHeaders headers) {
                    form.set("appid", resource.getClientId());
                    form.set("secret", resource.getClientSecret());
                    form.set("grant_type", "client_credential");
                }
            });
        }
    }
}
