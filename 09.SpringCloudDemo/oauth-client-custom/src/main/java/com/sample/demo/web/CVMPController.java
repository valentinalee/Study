package com.sample.demo.web;

import com.fasterxml.jackson.databind.JsonNode;
import com.sample.demo.client.*;
import org.apache.commons.lang.ArrayUtils;
import org.apache.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.http.*;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import javax.servlet.http.HttpServletRequest;

@RestController
@RequestMapping(value = "/cvmp")
public class CVMPController {
    private final Logger logger = Logger.getLogger(getClass());

    private OAuthClient cvmpRestClient;
    @Autowired
    private RedisTemplate redisTemplate;

    @RequestMapping(value = "/sendCommand" ,method = RequestMethod.POST)
    public JsonNode vehicles(HttpServletRequest request, @RequestHeader HttpHeaders headers, @RequestBody JsonNode body) {
//        JsonNode r = getCvmpRestClient().getForObject("https://localhost:10443/cvmp/api/v1.0/command/action/sendCommand", JsonNode.class);
        MultiValueMap<String, String> h =new LinkedMultiValueMap<>();
        h.set(HttpHeaders.CONTENT_TYPE,MediaType.APPLICATION_JSON_VALUE);
        h.set("app_key","test");
        HttpEntity entity = new HttpEntity<>(body,h);
        ResponseEntity<JsonNode> r = getCvmpRestClient().exchange("https://localhost:10443/cvmp/api/v1.0/command/action/sendCommand", HttpMethod.POST,entity, JsonNode.class);
        return r.getBody();
    }

    private OAuthClient getCvmpRestClient(){
        if(cvmpRestClient == null) {
            OAuthConfig config = new OAuthConfig();
            config.setTokenUrl("https://localhost:10443/cvmp/iocm/app/sec/v1.1.0/login");
            config.setUseRefreshUrl(true);
            config.setRefreshUrl("https://localhost:10443/cvmp/iocm/app/sec/v1.1.0/refreshToken");
            config.setAppId("test");
            config.setAppSecret("test");
            config.setAppIdName("appId");
            config.setAppSecretName("secret");
            config.setAuthScheme(AuthScheme.header);
            config.setRefreshTokenName("refreshToken");
            cvmpRestClient = new CVMPClient(config);
            cvmpRestClient.setTokenCache(new RedisTokenCache(redisTemplate,"APIPROXY:TOKEN:cvmp"));
        }
        return cvmpRestClient;
    }

    class CVMPClient extends OAuthClient{
        private Integer[] ERROR_CODES = new Integer[]{100000,100208,100006,100208};
        private final String ERRORCODE = "error_code";
        private final String ERRORMSG = "error_desc";

        public final String ACCESS_TOKEN = "accessToken";
        public final String TOKEN_TYPE = "tokenType";
        public final String EXPIRES_IN = "expiresIn";
        public final String REFRESH_TOKEN = "refreshToken";

        CVMPClient(OAuthConfig config) {
            super(config);
            RestTemplate template = new SSLOAuthClient().poolRestTemplate();
            setRestTemplate(template);
        }

        @Override
        protected <T> void handleResponse(ResponseEntity<T> responseEntity){
            HttpStatus status = responseEntity.getStatusCode();
            T body = responseEntity.getBody();
            if(status == HttpStatus.UNAUTHORIZED && body != null && body instanceof JsonNode) {
                JsonNode obj = (JsonNode) body;
                if(obj.hasNonNull(ERRORCODE)) {
                    Integer errcode = obj.get(ERRORCODE).asInt();
                    String errmsg = obj.get(ERRORMSG).asText();
                    if(ArrayUtils.contains(ERROR_CODES,errcode)) {
                        throw new OAuthException(errmsg,errcode.toString());
                    } else {
                        throw new HttpClientErrorException(HttpStatus.BAD_REQUEST,errmsg);
                    }
                }
            }
        }

        @Override
        protected OAuth2Token parseToken(JsonNode content){
            if(content.hasNonNull(ACCESS_TOKEN)) {
                String sToken = content.get(ACCESS_TOKEN).asText();
                OAuth2Token token = new OAuth2Token(sToken);
                token.setExpiresIn(content.get(EXPIRES_IN).asInt());
                token.setRefreshToken(content.get(REFRESH_TOKEN).asText());
                token.setScope(content.get(OAuth2Token.SCOPE).asText());
                token.setTokenType(content.get(TOKEN_TYPE).asText());
                return token;
            }
            return null;
        }
    }
}
