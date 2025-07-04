package com.bag.osmanager.config;

import com.bag.osmanager.config.filter.JwtAuthFilter;
import com.bag.osmanager.service.UserDetailsServiceImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.Collections; // Importe a classe Collections

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;
    private final UserDetailsServiceImpl userDetailsService;

    // ... (Seus outros beans: passwordEncoder, authenticationProvider, etc. permanecem iguais)
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
    
    // =========================================================
    //           👇👇 A CORREÇÃO ESTÁ AQUI 👇👇
    // =========================================================
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        
        // 1. Permite qualquer origem. O "*" é um curinga.
        configuration.setAllowedOrigins(Collections.singletonList("*"));
        
        // 2. Permite todos os métodos e headers comuns.
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type"));
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration); // Aplica a configuração a todos os endpoints
        return source;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(authorize -> authorize
                        // Suas regras de autorização permanecem as mesmas
                        .requestMatchers("/api/auth/**").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/funcionarios/register").permitAll()
                        .requestMatchers("/error").permitAll()
                        .requestMatchers(HttpMethod.PUT, "/api/ordens-servico/*/ciencia").hasRole("LIDER")
                        .requestMatchers(HttpMethod.PUT, "/api/ordens-servico/*/status").hasAnyRole("ADMIN", "MECANICO", "ANALISTA_CQ", "LIDER")
                        .requestMatchers(HttpMethod.PUT, "/api/ordens-servico/*/execucao").hasRole("MECANICO")
                        .requestMatchers(HttpMethod.PUT, "/api/ordens-servico/*/verificacao-cq").hasRole("ANALISTA_CQ")
                        .requestMatchers(HttpMethod.PUT, "/api/ordens-servico/*/aprovacao").hasRole("LIDER")
                        .requestMatchers(HttpMethod.POST, "/api/funcionarios").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.POST, "/api/equipamentos").hasAnyRole("ADMIN", "MECANICO")
                        .anyRequest().authenticated()
                )
                .authenticationProvider(authenticationProvider())
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}