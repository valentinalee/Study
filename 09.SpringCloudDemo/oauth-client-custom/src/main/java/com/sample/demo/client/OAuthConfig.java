package com.sample.demo.client;

import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;

public class OAuthConfig {
    private String tokenUrl;
    private String refreshUrl;
    private boolean canRefresh = true;
    private String appId;
    private String appSecret;
    private String appIdName;
    private String appSecretName;
    private String tokenName;
    private MultiValueMap<String, String> additionalParams = new LinkedMultiValueMap<>();

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

    public boolean isCanRefresh() {
        return canRefresh;
    }

    public void setCanRefresh(boolean canRefresh) {
        this.canRefresh = canRefresh;
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

    public MultiValueMap<String, String> getAdditionalParams() {
        return additionalParams;
    }
}
