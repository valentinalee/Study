package com.sample.demo.client;

import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;

public class OAuthConfig {
    private String tokenUrl;
    private String refreshUrl;
    private boolean useRefreshUrl = true;
    private String appId;
    private String appSecret;
    private String appIdName;
    private String appSecretName;
    private String tokenName;
    private String refreshTokenName;
    private MultiValueMap<String, String> additionalTokenParams = new LinkedMultiValueMap<>();
    private MultiValueMap<String, String> additionalRefreshParams = new LinkedMultiValueMap<>();
    private AuthScheme authScheme;

    public String getTokenUrl() {
        return tokenUrl;
    }

    public void setTokenUrl(String tokenUrl) {
        this.tokenUrl = tokenUrl;
    }

    public String getRefreshUrl() {
        return refreshUrl;
    }

    public void setRefreshUrl(String refreshUrl) {
        this.refreshUrl = refreshUrl;
    }

    public boolean isUseRefreshUrl() {
        return useRefreshUrl;
    }

    public void setUseRefreshUrl(boolean useRefreshUrl) {
        this.useRefreshUrl = useRefreshUrl;
    }

    public String getAppId() {
        return appId;
    }

    public void setAppId(String appId) {
        this.appId = appId;
    }

    public String getAppSecret() {
        return appSecret;
    }

    public void setAppSecret(String appSecret) {
        this.appSecret = appSecret;
    }

    public String getAppIdName() {
        return appIdName;
    }

    public void setAppIdName(String appIdName) {
        this.appIdName = appIdName;
    }

    public String getAppSecretName() {
        return appSecretName;
    }

    public void setAppSecretName(String appSecretName) {
        this.appSecretName = appSecretName;
    }

    public String getTokenName() {
        return tokenName;
    }

    public void setTokenName(String tokenName) {
        this.tokenName = tokenName;
    }

    public MultiValueMap<String, String> getAdditionalTokenParams() {
        return additionalTokenParams;
    }

    public MultiValueMap<String, String> getAdditionalRefreshParams() {
        return additionalRefreshParams;
    }

    public AuthScheme getAuthScheme() {
        return authScheme;
    }

    public void setAuthScheme(AuthScheme authScheme) {
        this.authScheme = authScheme;
    }

    public String getRefreshTokenName() {
        return refreshTokenName;
    }

    public void setRefreshTokenName(String refreshTokenName) {
        this.refreshTokenName = refreshTokenName;
    }
}
