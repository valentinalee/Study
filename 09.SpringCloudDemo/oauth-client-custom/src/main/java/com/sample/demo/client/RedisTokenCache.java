package com.sample.demo.client;

import org.springframework.data.redis.core.RedisTemplate;

public class RedisTokenCache implements TokenCache {
    private RedisTemplate redisTemplate;
    private String key;

    public RedisTokenCache(RedisTemplate template,String key){
        this.redisTemplate = template;
        this.key = key;
    }

    @Override
    public String getKey() {
        return key;
    }

    @Override
    public void storeToken(OAuth2Token token) {
        redisTemplate.opsForValue().set(this.getKey(),token);
        redisTemplate.expireAt(this.getKey(),token.getExpiration());
    }

    @Override
    public OAuth2Token readToken() {
        return (OAuth2Token) redisTemplate.opsForValue().get(this.getKey());
    }

    @Override
    public void removeToken() {
        redisTemplate.delete(this.getKey());
    }
}
