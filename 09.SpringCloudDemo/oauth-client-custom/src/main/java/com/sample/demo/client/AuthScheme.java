package com.sample.demo.client;

/**
 * Enumeration of possible methods for transmitting authentication credentials.
 */
public enum AuthScheme {
    /**
     * Send an Authorization header.
     */
    header,

    /**
     * Send a query parameter in the URI.
     */
    query,

    /**
     * Send in the form body.
     */
    form,

    /**
     * Do not send at all.
     */
    none
}
