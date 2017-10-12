package com.sample.demo.web;

import com.fasterxml.jackson.databind.JsonNode;
import com.sample.demo.client.*;
import org.apache.log4j.Logger;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.HttpClientErrorException;

import javax.servlet.http.HttpServletRequest;

@RestController
@RequestMapping(value = "/weixin")
public class WeiXinController {
    private final Logger logger = Logger.getLogger(getClass());

    private OAuthClient weixinRestClient;

    @RequestMapping(value = "/getcallbackip" ,method = RequestMethod.GET)
    public JsonNode getcallbackip(HttpServletRequest request) {
        JsonNode r = getWeixinRestClient().getForObject("https://api.weixin.qq.com/cgi-bin/getcallbackip", JsonNode.class);
        return r;
    }

    @RequestMapping(value = "/getuser" ,method = RequestMethod.GET)
    public JsonNode getuser(HttpServletRequest request) {
        JsonNode r = getWeixinRestClient().getForObject("https://api.weixin.qq.com/cgi-bin/user/get", JsonNode.class);
        return r;
    }

    private OAuthClient getWeixinRestClient(){
        if(weixinRestClient == null) {
            OAuthConfig config = new OAuthConfig();
            config.setTokenUrl("https://api.weixin.qq.com/cgi-bin/token");
            config.setUseRefreshUrl(false);
            config.setAppId("wx122309256170e7a0");
            config.setAppSecret("c4fba09c00b7e69b62e7d00d692eda96");
            config.setAppIdName("appid");
            config.setAppSecretName("secret");
            config.setTokenName("access_token");
            config.getAdditionalTokenParams().set("grant_type", "client_credential");
            config.setAuthScheme(AuthScheme.form);
            weixinRestClient = new WeixinClient(config);
        }
        return weixinRestClient;
    }

    class WeixinClient extends OAuthClient{
        WeixinClient(OAuthConfig config) {
            super(config);
        }

        @Override
        protected <T> void handleResponse(ResponseEntity<T> responseEntity){
            HttpStatus status = responseEntity.getStatusCode();
            T body = responseEntity.getBody();
            if(status == HttpStatus.OK && body != null && body instanceof JsonNode) {
                JsonNode obj = (JsonNode) body;
                if(obj.hasNonNull("errcode")) {
                    int errcode = obj.get("errcode").asInt();
                    String errmsg = obj.get("errmsg").asText();
                    if(errcode == 40013) {
                        throw new OAuthException(errmsg);
                    } else {
                        throw new HttpClientErrorException(HttpStatus.BAD_REQUEST,errmsg);
                    }
                }
            }
        }

        @Override
        protected OAuth2Token parseToken(JsonNode content){
            if(content.hasNonNull(OAuth2Token.ACCESS_TOKEN)) {
                String sToken = content.get(OAuth2Token.ACCESS_TOKEN).asText();
                OAuth2Token token = new OAuth2Token(sToken);
                token.setExpiresIn(content.get(OAuth2Token.EXPIRES_IN).asInt());
                return token;
            }
            return null;
        }
    }


}
