package com.sample.demo.client;

import com.fasterxml.jackson.databind.JsonNode;
import org.springframework.http.*;
import org.springframework.util.Assert;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.io.UnsupportedEncodingException;
import java.net.URI;
import java.net.URISyntaxException;
import java.net.URLEncoder;
import java.util.Map;


public class OAuthClient {

    private OAuth2Token accessToken;
    private OAuthConfig config;
    private TokenCache cache;

    private RestTemplate restTemplate = new RestTemplate();

    public OAuthClient(OAuthConfig config) {
        this.config = config;
    }

    public OAuthClient(OAuthConfig config,RestTemplate template){
        this(config);
        setRestTemplate(template);
    }

    public void setRestTemplate(RestTemplate restTemplate) {
        Assert.notNull(restTemplate, "RestTemplate must not be null");
        this.restTemplate = restTemplate;
    }

    public RestTemplate getRestTemplate() {
        return restTemplate;
    }

    public TokenCache getCache() {
        return cache;
    }

    public void setCache(TokenCache cache) {
        this.cache = cache;
    }

    public OAuthConfig getConfig() {
        return config;
    }

    public void setConfig(OAuthConfig config) {
        this.config = config;
    }


    // GET

    public <T> T getForObject(String url, Class<T> responseType,Object... uriVariables) throws RestClientException {
        return this.exchange(url,HttpMethod.GET,null,responseType,uriVariables).getBody();
    }

    public <T> T getForObject(String url, Class<T> responseType, Map<String, ?> uriVariables) throws RestClientException {
        return this.exchange(url,HttpMethod.GET,null,responseType,uriVariables).getBody();
    }

    public <T> T getForObject(URI url, Class<T> responseType) throws RestClientException {
        return this.exchange(url,HttpMethod.GET,null,responseType).getBody();
    }

    public <T> ResponseEntity<T> getForEntity(String url, Class<T> responseType, Map<String, ?> uriVariables)
            throws RestClientException {
        return this.exchange(url,HttpMethod.GET,null,responseType,uriVariables);
    }

    public <T> ResponseEntity<T> getForEntity(URI url, Class<T> responseType) throws RestClientException {
        return this.exchange(url,HttpMethod.GET,null,responseType);
    }

    // exchange

    public <T> ResponseEntity<T> exchange(String url, HttpMethod method, HttpEntity<?> requestEntity,
                                         Class<T> responseType, Object... uriVariables) throws RestClientException {
        URI expanded = restTemplate.getUriTemplateHandler().expand(url, uriVariables);
        return this.exchange(expanded,method,requestEntity,responseType);
    }

    public <T> ResponseEntity<T> exchange(String url, HttpMethod method, HttpEntity<?> requestEntity,
                                          Class<T> responseType, Map<String, ?> uriVariables) throws RestClientException {
        URI expanded = restTemplate.getUriTemplateHandler().expand(url, uriVariables);
        return this.exchange(expanded,method,requestEntity,responseType);
    }

    public <T> ResponseEntity<T> exchange(URI url, HttpMethod method, HttpEntity<?> requestEntity,
                                          Class<T> responseType) throws RestClientException {
        URI uri = url;
        AuthScheme authScheme = config.getAuthScheme();
        OAuth2Token token = fetchAccessToken();
        if (AuthScheme.query.equals(authScheme)
                || AuthScheme.form.equals(authScheme)) {
            uri = appendQueryParameter(uri, token);
        }
        if (AuthScheme.header.equals(authScheme)) {
            requestEntity = addAuthorizationHeader(requestEntity,token);
        }
        ResponseEntity<T> result = this.execute(uri,method, requestEntity, responseType);
        return result;
    }

    protected <T> ResponseEntity<T> execute(String url,HttpMethod method, HttpEntity<?> requestEntity, Class<T> responseType) {
        URI uri = restTemplate.getUriTemplateHandler().expand(url);
        return this.execute(uri,method,requestEntity,responseType);
    }

    protected <T> ResponseEntity<T> execute(URI uri,HttpMethod method, HttpEntity<?> requestEntity, Class<T> responseType) {
        ResponseEntity<T> result = restTemplate.exchange(uri,method,requestEntity,responseType);
        try {
            handleResponse(result);
        }catch (OAuthException ex){
            setAccessToken(null);
            throw ex;
        }
        return result;
    }

    protected <T> void handleResponse(ResponseEntity<T> responseEntity){
        HttpStatus status = responseEntity.getStatusCode();
        T body = responseEntity.getBody();
        if(status == HttpStatus.UNAUTHORIZED) {
            if(body != null && body instanceof JsonNode){
                JsonNode obj = (JsonNode) body;
                if(obj.hasNonNull("error")) {
                    String error = obj.get("error").asText();
                    String errmsg = obj.get("error_description").asText();
                    throw new OAuthException(errmsg,error);
                }
            }
            throw new OAuthException("auth error!");
        }
    }

    protected synchronized OAuth2Token fetchAccessToken() {
        //如果不存在，首先从缓存获取token
        if(accessToken == null && cache != null){
            accessToken = cache.readToken();
        }
        //如果token过期
        if(accessToken != null && accessToken.isExpired()){
            setAccessToken(execRefreshReqest(accessToken));
        }
        if (accessToken == null) {
            //获取token
            setAccessToken(execTokenReqest());
        }
        return accessToken;
    }

    public OAuth2Token getAccessToken(){
        return this.accessToken;
    }

    protected void setAccessToken(OAuth2Token token){
        this.accessToken = token;
        //清除缓存
        if(cache != null) {
            if (token == null) {
                cache.removeToken();
            } else {
                cache.storeToken(token);
            }
        }
    }

    protected OAuth2Token execTokenReqest(){
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
        MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
        params.set(config.getAppIdName(), config.getAppId());
        params.set(config.getAppSecretName(), config.getAppSecret());
        params.setAll(config.getAdditionalTokenParams().toSingleValueMap());
        HttpEntity<MultiValueMap> entity = new HttpEntity<>(params, headers);
        ResponseEntity<JsonNode> responseEntity = this.execute(config.getTokenUrl(), HttpMethod.POST, entity, JsonNode.class);
        HttpStatus status = responseEntity.getStatusCode();
        if (status == HttpStatus.OK) {
            return parseToken(responseEntity.getBody());
        }
        return null;
    }

    protected OAuth2Token parseToken(JsonNode content){
        if(content.hasNonNull(OAuth2Token.ACCESS_TOKEN)) {
            String sToken = content.get(OAuth2Token.ACCESS_TOKEN).asText();
            OAuth2Token token = new OAuth2Token(sToken);
            token.setExpiresIn(content.get(OAuth2Token.EXPIRES_IN).asInt());
            token.setRefreshToken(content.get(OAuth2Token.REFRESH_TOKEN).asText());
            token.setScope(content.get(OAuth2Token.SCOPE).asText());
            token.setTokenType(content.get(OAuth2Token.TOKEN_TYPE).asText());
            return token;
        }
        return null;
    }

    protected OAuth2Token execRefreshReqest(OAuth2Token token) {
        if(config.isUseRefreshUrl()){
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
            MultiValueMap<String, String> params = new LinkedMultiValueMap<String, String>();
            params.set(config.getAppIdName(), config.getAppId());
            params.set(config.getAppSecretName(), config.getAppSecret());
            params.set(config.getRefreshTokenName(), token.getRefreshToken());
            params.setAll(config.getAdditionalRefreshParams().toSingleValueMap());
            HttpEntity<MultiValueMap> entity = new HttpEntity<>(params, headers);
            ResponseEntity<JsonNode> responseEntity = this.execute(config.getRefreshUrl(), HttpMethod.POST, entity, JsonNode.class);
            HttpStatus status = responseEntity.getStatusCode();
            if (status == HttpStatus.OK) {
                return parseToken(responseEntity.getBody());
            }
        }else {
            return execTokenReqest();
        }
        return null;
    }

    protected URI appendQueryParameter(URI uri, OAuth2Token token) {
        if(token == null){
            return uri;
        }
        try {

            // TODO: there is some duplication with UriUtils here. Probably unavoidable as long as this
            // method signature uses URI not String.
            String query = uri.getRawQuery(); // Don't decode anything here
            String queryFragment = config.getTokenName() + "=" + URLEncoder.encode(token.getAccessToken(), "UTF-8");
            if (query == null) {
                query = queryFragment;
            } else {
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

        } catch (URISyntaxException e) {
            throw new IllegalArgumentException("Could not parse URI", e);
        } catch (UnsupportedEncodingException e) {
            throw new IllegalArgumentException("Could not encode URI", e);
        }

    }

    protected  HttpEntity<?> addAuthorizationHeader(HttpEntity<?> request, OAuth2Token token){
        if(token == null) {
            return request;
        }
        HttpEntity<?> result = request;
        if(result == null || result.getHeaders() == null){
            HttpHeaders headers = new HttpHeaders();
            result = new HttpEntity(request.getBody(),headers);
        }
        result.getHeaders().set("Authorization", String.format("%s %s", OAuth2Token.BEARER_TYPE, token.getAccessToken()));
        return result;
    }
}
