package com.sample.demo.service;

import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

public class CustomUserDetailsService implements UserDetailsService {

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        if(username.equals("user_1")){
            return User.withUsername(username).password("123456").roles("USER").build();
        } else if(username.equals("user_2")){
            return User.withUsername(username).password("123456").roles("USER","ADMIN").build();
        }
        throw new UsernameNotFoundException(username + " not found");
    }
}
