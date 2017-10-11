package com.sample.demo.client;

import org.apache.http.Header;
import org.apache.http.client.HttpClient;
import org.apache.http.config.Registry;
import org.apache.http.config.RegistryBuilder;
import org.apache.http.conn.socket.ConnectionSocketFactory;
import org.apache.http.conn.socket.PlainConnectionSocketFactory;
import org.apache.http.conn.ssl.SSLConnectionSocketFactory;
import org.apache.http.impl.client.DefaultConnectionKeepAliveStrategy;
import org.apache.http.impl.client.DefaultHttpRequestRetryHandler;
import org.apache.http.impl.client.HttpClientBuilder;
import org.apache.http.impl.client.HttpClients;
import org.apache.http.impl.conn.PoolingHttpClientConnectionManager;
import org.apache.http.message.BasicHeader;
import org.apache.http.ssl.SSLContexts;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.client.HttpComponentsClientHttpRequestFactory;
import org.springframework.http.converter.HttpMessageConverter;
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;
import org.springframework.security.oauth2.client.DefaultOAuth2ClientContext;
import org.springframework.security.oauth2.client.OAuth2RestTemplate;
import org.springframework.security.oauth2.client.resource.OAuth2ProtectedResourceDetails;
import org.springframework.security.oauth2.client.token.AccessTokenRequest;
import org.springframework.security.oauth2.client.token.RequestEnhancer;
import org.springframework.security.oauth2.client.token.grant.client.ClientCredentialsAccessTokenProvider;
import org.springframework.security.oauth2.client.token.grant.client.ClientCredentialsResourceDetails;
import org.springframework.security.oauth2.common.AuthenticationScheme;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import javax.net.ssl.SSLContext;
import java.io.IOException;
import java.security.*;
import java.security.cert.CertificateException;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.TimeUnit;

public class SSLOAuthClient {

    public SSLOAuthClient(){

    }

    public RestTemplate poolRestTemplate() {
        try {
            return new RestTemplate(createHttpRequestFactory());
        } catch (Exception e) {
            e.printStackTrace();
        }
        return null;
    }

    private static HttpComponentsClientHttpRequestFactory createHttpRequestFactory() throws KeyStoreException, IOException, CertificateException, NoSuchAlgorithmException {
        String keystorePassword = "123456";
        //客户端证书库
        KeyStore clientKeystore = KeyStore.getInstance("pkcs12");
        Resource clientKeyResource = new ClassPathResource("client.p12");
        clientKeystore.load(clientKeyResource.getInputStream(), new char[]{});
        //信任证书库
        KeyStore trustKeystore = KeyStore.getInstance("jks");
        Resource trustKeyResource = new ClassPathResource("ca-trust.jks");
        trustKeystore.load(trustKeyResource.getInputStream(), keystorePassword.toCharArray());

        final SSLContext sslContext;
        try {
            sslContext = SSLContexts.custom()
                    .loadKeyMaterial(clientKeystore, new char[]{})
                    .loadTrustMaterial(trustKeystore, (x509Certificates, s) -> false)
                    .build();
        } catch (NoSuchAlgorithmException | KeyManagementException | KeyStoreException | UnrecoverableKeyException e) {
            throw new IllegalStateException("Error loading key or trust material", e);
        }

        final SSLConnectionSocketFactory sslSocketFactory = new SSLConnectionSocketFactory(
                sslContext,
                null,//new String[] { "TLSv1.2" },
                null,
                SSLConnectionSocketFactory.getDefaultHostnameVerifier());
        final Registry<ConnectionSocketFactory> registry = RegistryBuilder.<ConnectionSocketFactory>create()
                .register("http", PlainConnectionSocketFactory.getSocketFactory())
                .register("https", sslSocketFactory)
                .build();


        // 长连接保持30秒
        PoolingHttpClientConnectionManager pollingConnectionManager = new PoolingHttpClientConnectionManager(registry);
        // 总连接数
        pollingConnectionManager.setMaxTotal(1000);
        // 同路由的并发数
        pollingConnectionManager.setDefaultMaxPerRoute(1000);

        HttpClientBuilder httpClientBuilder = HttpClients.custom();
        httpClientBuilder.setSSLSocketFactory(sslSocketFactory); //SSL
        httpClientBuilder.setConnectionManager(pollingConnectionManager);
        // 重试次数，默认是3次，没有开启
        httpClientBuilder.setRetryHandler(new DefaultHttpRequestRetryHandler(2, true));
        // 保持长连接配置，需要在头添加Keep-Alive
        httpClientBuilder.setKeepAliveStrategy(new DefaultConnectionKeepAliveStrategy());

//        RequestConfig.Builder builder = RequestConfig.custom();
//        builder.setConnectionRequestTimeout(200);
//        builder.setConnectTimeout(5000);
//        builder.setSocketTimeout(5000);
//
//        RequestConfig requestConfig = builder.build();
//        httpClientBuilder.setDefaultRequestConfig(requestConfig);

        List<Header> headers = new ArrayList<>();
        headers.add(new BasicHeader("User-Agent", "Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/31.0.1650.16 Safari/537.36"));
        headers.add(new BasicHeader("Accept-Encoding", "gzip,deflate"));
//        headers.add(new BasicHeader("Accept-Language", "zh-CN"));
        headers.add(new BasicHeader("Connection", "keep-alive"));

        httpClientBuilder.setDefaultHeaders(headers);

        HttpClient httpClient = httpClientBuilder.build();

        // httpClient连接配置，底层是配置RequestConfig
        HttpComponentsClientHttpRequestFactory clientHttpRequestFactory = new HttpComponentsClientHttpRequestFactory(httpClient);
        // 连接超时
        clientHttpRequestFactory.setConnectTimeout(5000);
        // 数据读取超时时间，即SocketTimeout
        clientHttpRequestFactory.setReadTimeout(5000);
        // 连接不够用的等待时间，不宜过长，必须设置，比如连接不够用时，时间过长将是灾难性的
        clientHttpRequestFactory.setConnectionRequestTimeout(200);
        // 缓冲请求数据，默认值是true。通过POST或者PUT大量发送数据时，建议将此属性更改为false，以免耗尽内存。
        // clientHttpRequestFactory.setBufferRequestBody(false);

        return clientHttpRequestFactory;
    }


    public OAuth2RestTemplate weixinRestTemplate() throws CertificateException, NoSuchAlgorithmException, KeyStoreException, IOException {

        ClientCredentialsResourceDetails resourceDetails = new ClientCredentialsResourceDetails();
        resourceDetails.setAccessTokenUri("https://api.weixin.qq.com/cgi-bin/token");
        resourceDetails.setClientId("wx122309256170e7a0");
        resourceDetails.setClientSecret("c4fba09c00b7e69b62e7d00d692eda96");
        resourceDetails.setGrantType("client_credential");
        resourceDetails.setAuthenticationScheme(AuthenticationScheme.form);

        DefaultOAuth2ClientContext clientContext = new DefaultOAuth2ClientContext();
//        clientContext.setAccessToken();

        OAuth2RestTemplate template = new OAuth2RestTemplate(resourceDetails, clientContext);
        template.setAccessTokenProvider(new WeixinClientCredentialsAccessTokenProvider());
        template.setRetryBadAccessTokens(true);
        template.setRequestFactory(createHttpRequestFactory());

        return template;
    }

    class WeixinClientCredentialsAccessTokenProvider extends ClientCredentialsAccessTokenProvider {

        public WeixinClientCredentialsAccessTokenProvider() {
            List<HttpMessageConverter<?>> converters = new ArrayList<HttpMessageConverter<?>>();
            converters.add(new MappingJackson2HttpMessageConverter());
            this.setMessageConverters(converters);
            this.setTokenRequestEnhancer(new RequestEnhancer() {
                @Override
                public void enhance(AccessTokenRequest request, OAuth2ProtectedResourceDetails resource,
                                    MultiValueMap<String, String> form, HttpHeaders headers) {
                    form.set("appid", resource.getClientId());
                    form.set("secret", resource.getClientSecret());
                    form.set("grant_type", "client_credential");
                }
            });
        }
    }
}
