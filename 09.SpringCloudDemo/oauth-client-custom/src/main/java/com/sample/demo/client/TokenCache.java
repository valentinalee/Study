package com.sample.demo.client;

public interface TokenCache {

    String getKey();

    void storeToken(OAuth2Token token);

    OAuth2Token readToken();

    void removeToken();
}
