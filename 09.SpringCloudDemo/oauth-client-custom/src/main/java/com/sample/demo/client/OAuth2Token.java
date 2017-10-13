package com.sample.demo.client;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.io.Serializable;
import java.util.Date;
import java.util.Set;

@JsonIgnoreProperties(value = {"expired", "expiresIn"})
public class OAuth2Token  implements Serializable {
    private static final long serialVersionUID = 914967629530462926L;

    public static String BEARER_TYPE = "Bearer";
    public static String OAUTH2_TYPE = "OAuth2";
    public static String ACCESS_TOKEN = "access_token";
    public static String TOKEN_TYPE = "token_type";
    public static String EXPIRES_IN = "expires_in";
    public static String REFRESH_TOKEN = "refresh_token";
    public static String SCOPE = "scope";

    private String accessToken;
    private Date expiration;
    private String tokenType = BEARER_TYPE.toLowerCase();
    private String refreshToken;
    private String scope;

    public OAuth2Token(String token) {
        this.accessToken = token;
    }

    private OAuth2Token() {
        this((String) null);
    }

    public OAuth2Token(OAuth2Token accessToken) {
        this(accessToken.getAccessToken());
        setRefreshToken(accessToken.getRefreshToken());
        setExpiration(accessToken.getExpiration());
        setScope(accessToken.getScope());
        setTokenType(accessToken.getTokenType());
    }

    public void setAccessToken(String accessToken) {
        this.accessToken = accessToken;
    }

    public String getAccessToken() {
        return accessToken;
    }

    public int getExpiresIn() {
        return expiration != null ? Long.valueOf((expiration.getTime() - System.currentTimeMillis()) / 1000L)
                .intValue() : 0;
    }

    public void setExpiresIn(int delta) {
        setExpiration(new Date(System.currentTimeMillis() + delta * 1000L));
    }

    public Date getExpiration() {
        return expiration;
    }

    public void setExpiration(Date expiration) {
        this.expiration = expiration;
    }

    @JsonIgnoreProperties
    public boolean isExpired() {
        return expiration != null && expiration.before(new Date());
    }

    public String getTokenType() {
        return tokenType;
    }

    public void setTokenType(String tokenType) {
        this.tokenType = tokenType;
    }

    public String getRefreshToken() {
        return refreshToken;
    }

    public void setRefreshToken(String refreshToken) {
        this.refreshToken = refreshToken;
    }

    public String getScope() {
        return scope;
    }

    public void setScope(String scope) {
        this.scope = scope;
    }

    @Override
    public boolean equals(Object obj) {
        return obj != null && toString().equals(obj.toString());
    }

    @Override
    public int hashCode() {
        return toString().hashCode();
    }

    @Override
    public String toString() {
        return String.valueOf(getAccessToken());
    }

}
