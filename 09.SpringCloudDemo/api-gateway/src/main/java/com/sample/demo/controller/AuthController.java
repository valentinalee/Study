package com.sample.demo.controller;

import com.sample.demo.filter.HttpRequestWrapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.provider.ClientDetailsService;
import org.springframework.security.oauth2.provider.endpoint.TokenEndpoint;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@RestController
public class AuthController {

    @Autowired
    TokenEndpoint tokenEndPoint;
    @Autowired
    ClientDetailsService clientDetailsService;
    @Autowired
    AuthenticationManager authenticationManager;

//    @RequestMapping(value = "/auth/login", method= RequestMethod.POST)
//    public ResponseEntity<OAuth2AccessToken> login(@RequestParam
//            Map<String, String> parameters) throws HttpRequestMethodNotSupportedException {
//        String clientId = "client_2";
//        String clientSecret = "123456";
//        parameters.put("grant_type","password");
//        parameters.put("client_id",clientId);
//        parameters.put("client_secret",clientSecret);
//        ClientDetails clientDetails = clientDetailsService.loadClientByClientId(clientId);
//        UsernamePasswordAuthenticationToken principal = new UsernamePasswordAuthenticationToken(clientId,clientSecret,clientDetails.getAuthorities());
//        ResponseEntity<OAuth2AccessToken> response = tokenEndPoint.postAccessToken(principal, parameters);
//        return response;
//    }

    @RequestMapping(value = "/auth/login", method= RequestMethod.POST)
    public void login(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        String clientId = "client_2";
        String clientSecret = "123456";
        SecurityContextHolder.getContext().setAuthentication(null);
        request.getRequestDispatcher("/oauth/token?grant_type=password&client_id="+ clientId + "&client_secret=" + clientSecret).forward(request,response);
    }

    @RequestMapping(value = "/auth/app", method= RequestMethod.POST)
    public void appToken(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        String clientId = request.getParameter("appId");
        String clientSecret = request.getParameter("appSecret");
        SecurityContextHolder.getContext().setAuthentication(null);
        Map<String, String[]> parameters = new HashMap<>();
        parameters.put("grant_type", new String[]{"client_credentials"});
        parameters.put("client_id",new String[]{clientId});
        parameters.put("client_secret",new String[]{clientSecret});
        HttpRequestWrapper requestWrapper = new HttpRequestWrapper(request, parameters);
        requestWrapper.removeParameter("appId");
        requestWrapper.removeParameter("appSecret");
        request.getRequestDispatcher("/oauth/token").forward(requestWrapper,response);
    }

}
