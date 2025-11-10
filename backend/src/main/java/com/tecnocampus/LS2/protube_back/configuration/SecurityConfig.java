package com.tecnocampus.LS2.protube_back.configuration;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

import java.util.Arrays;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    /**
     * 全局 CorsFilter：Spring 会在 filter 链中应用它（无需调用 http.cors()，避免 deprecated 警告）
     */
    @Bean
    public CorsFilter corsFilter() {
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();

        CorsConfiguration config = new CorsConfiguration();
        config.setAllowCredentials(true);

        // 开发环境：允许前端 origin
        // 建议指定具体前端地址，避免使用 "*" 生产风险
        config.setAllowedOriginPatterns(Arrays.asList("http://localhost:5173")); // 支持通配或具体域

        // 允许所有常见头和方法（包括 OPTIONS）
        config.addAllowedHeader(CorsConfiguration.ALL);
        config.addAllowedMethod(CorsConfiguration.ALL);

        // 注册到所有路径
        source.registerCorsConfiguration("/**", config);
        return new CorsFilter(source);
    }

    /**
     * Security filter chain（Lambda 风格，兼容 6.1+）
     */
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                // 不调用 http.cors() 来避免 deprecated 警告；我们提供 CorsFilter Bean 由容器注册应用
                .csrf(csrf -> csrf.disable())
                .headers(headers -> headers.frameOptions(frame -> frame.disable())) // 允许 H2 iframe

                .authorizeHttpRequests(authorize -> authorize
                        // 允许 OPTIONS 预检请求通过（很重要）
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                        // 放行注册/登录和 H2 控制台
                        .requestMatchers("/api/auth/**", "/h2-console/**").permitAll()

                        // 如果你希望 videos 对所有人开放（前端无需登录）
                        .requestMatchers("/api/videos/**").permitAll()

                        // 其他接口需要认证
                        .anyRequest().authenticated()
                );

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
