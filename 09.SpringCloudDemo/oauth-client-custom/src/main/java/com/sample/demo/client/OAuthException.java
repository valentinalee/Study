package com.sample.demo.client;

public class OAuthException extends RuntimeException {
    private String error;

    public OAuthException(String msg) {
        super(msg);
    }

    public OAuthException(String msg, Throwable t) {
        super(msg, t);
    }

    public OAuthException(String msg, Throwable t, String error) {
        super(msg, t);
        this.error = error;
    }

    public OAuthException(String msg, String error) {
        super(msg);
        this.error = error;
    }

    public String getError() {
        return error;
    }

    @Override
    public String toString() {
        return String.format("error=%s error_description=%s", this.getError(),this.getMessage());
    }
}
