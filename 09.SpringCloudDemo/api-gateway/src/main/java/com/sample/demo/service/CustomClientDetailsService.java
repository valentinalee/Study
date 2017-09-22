package com.sample.demo.service;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.provider.ClientDetails;
import org.springframework.security.oauth2.provider.ClientDetailsService;
import org.springframework.security.oauth2.provider.ClientRegistrationException;
import org.springframework.security.oauth2.provider.client.BaseClientDetails;

import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;

public class CustomClientDetailsService implements ClientDetailsService {
    private static final String DEMO_RESOURCE_ID = "order";

    @Override
    public ClientDetails loadClientByClientId(String clientId) throws ClientRegistrationException {
        if(clientId.equals("client_1")) {
            BaseClientDetails details = new BaseClientDetails();
            details.setClientId(clientId);
            details.setResourceIds(Arrays.asList(DEMO_RESOURCE_ID,"a","b"));
            details.setAuthorizedGrantTypes(Arrays.asList("client_credentials", "refresh_token"));
            details.setScope(Arrays.asList("select","read", "trust"));
            Set<GrantedAuthority> authorities = new HashSet<GrantedAuthority>();
            authorities.add(new SimpleGrantedAuthority("ROLE_CLIENT"));
            details.setAuthorities(authorities);
            details.setClientSecret("123456");
            details.addAdditionalInformation("test","123");
            return details;
        } else if(clientId.equals("client_2")) {
            BaseClientDetails details = new BaseClientDetails();
            details.setClientId(clientId);
            details.setResourceIds(Arrays.asList(DEMO_RESOURCE_ID,"a"));
            details.setAuthorizedGrantTypes(Arrays.asList("password", "refresh_token"));
            details.setScope(Arrays.asList("select","read", "trust"));
            Set<GrantedAuthority> authorities = new HashSet<GrantedAuthority>();
            authorities.add(new SimpleGrantedAuthority("ROLE_CLIENT"));
            details.setAuthorities(authorities);
            details.setClientSecret("123456");
            details.addAdditionalInformation("test","4566");
            return details;
        }
        throw new ClientRegistrationException(clientId);
    }
}
