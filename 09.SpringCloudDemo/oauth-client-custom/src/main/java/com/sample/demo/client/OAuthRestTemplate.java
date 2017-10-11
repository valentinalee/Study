package com.sample.demo.client;

import com.alibaba.fastjson.JSONObject;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.http.auth.AuthenticationException;
import org.springframework.http.*;
import org.springframework.http.client.ClientHttpRequest;
import org.springframework.http.client.ClientHttpRequestFactory;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.*;

import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.net.URI;
import java.net.URISyntaxException;
import java.net.URLEncoder;
import com.alibaba.fastjson.JSON;


public class OAuthRestTemplate extends RestTemplate {

    private  OAuth2Token accessToken;
    private OAuthConfig config;

    public OAuthRestTemplate(OAuthConfig config){
        this.config = config;
    }

    public OAuthRestTemplate(OAuthConfig config,ClientHttpRequestFactory requestFactory) {
        this(config);
        setRequestFactory(requestFactory);
    }

    @Override
    public void setErrorHandler(ResponseErrorHandler errorHandler) {
//        errorHandler = new DefaultResponseErrorHandler();
        super.setErrorHandler(errorHandler);
    }

    @Override
    protected ClientHttpRequest createRequest(URI uri, HttpMethod method) throws IOException {
        OAuth2Token token = accessToken;
        if(token != null){
            //TODO：附加token请求
            uri = appendQueryParameter(uri, token);
        }

        ClientHttpRequest req = super.createRequest(uri, method);
        return req;
    }

    @Override
    protected <T> T doExecute(URI url, HttpMethod method, RequestCallback requestCallback,
                              ResponseExtractor<T> responseExtractor) throws RestClientException {
        RuntimeException rethrow = null;
        try {
            return super.doExecute(url, method, requestCallback, responseExtractor);
        }
        catch (Exception e) {
            // Don't reveal the token value in case it is logged
            rethrow = new RestClientException("Invalid token");
        }
        throw rethrow;
    }

    private OAuth2Token getAccessToken() throws Exception {

        //TODO:如果不存在，首先从redis获取token
        if(accessToken == null || accessToken.isExpired()){
            //调用VSS服务,服务接口参数需要确认
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
            MultiValueMap<String, String> params= new LinkedMultiValueMap<String, String>();
            params.set(config.getAppIdName(),config.getAppId());
            params.set(config.getAppSecretName(),config.getAppSecret());
            params.setAll(config.getAdditionalParams().toSingleValueMap());
            HttpEntity<MultiValueMap> entity = new HttpEntity<>(params,headers);
            ResponseEntity<String> responseEntity = super.exchange(config.getTokenUrl(), HttpMethod.POST,entity,String.class);
            HttpStatus status = responseEntity.getStatusCode();
            if(status == HttpStatus.OK){
                //TODO:根据json结果返回token对象，并更新redis
                //accessToken =
                JSONObject obj = (JSONObject) JSON.parse(responseEntity.getBody());
                String sToken = obj.getString(OAuth2Token.ACCESS_TOKEN);
                accessToken = new OAuth2Token(sToken);
                accessToken.setExpiresIn(obj.getIntValue(OAuth2Token.EXPIRES_IN));

            } else if(status == HttpStatus.UNAUTHORIZED) {
                //100208	AppId or secret is not right.
                throw new AuthenticationException("AppId or secret is not right");
            } else {
                throw new Exception("unknown");
            }

        }
        return accessToken;
    }

    public void refreshToken(){

    }

    protected URI appendQueryParameter(URI uri, OAuth2Token token) {

        try {

            // TODO: there is some duplication with UriUtils here. Probably unavoidable as long as this
            // method signature uses URI not String.
            String query = uri.getRawQuery(); // Don't decode anything here
            String queryFragment = config.getTokenName() + "=" + URLEncoder.encode(token.getValue(), "UTF-8");
            if (query == null) {
                query = queryFragment;
            }
            else {
                query = query + "&" + queryFragment;
            }

            // first form the URI without query and fragment parts, so that it doesn't re-encode some query string chars
            // (SECOAUTH-90)
            URI update = new URI(uri.getScheme(), uri.getUserInfo(), uri.getHost(), uri.getPort(), uri.getPath(), null,
                    null);
            // now add the encoded query string and the then fragment
            StringBuffer sb = new StringBuffer(update.toString());
            sb.append("?");
            sb.append(query);
            if (uri.getFragment() != null) {
                sb.append("#");
                sb.append(uri.getFragment());
            }

            return new URI(sb.toString());

        }
        catch (URISyntaxException e) {
            throw new IllegalArgumentException("Could not parse URI", e);
        }
        catch (UnsupportedEncodingException e) {
            throw new IllegalArgumentException("Could not encode URI", e);
        }

    }
}
