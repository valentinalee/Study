package com.sample.demo.client;

public interface TokenCache {
    /**
     * Store an access token.
     *
     * @param token The token to store.
     */
    void storeToken(OAuth2Token token);

    /**
     * Read an access token from the store.
     *
     * @return The access token to read.
     */
    OAuth2Token readToken();
}
