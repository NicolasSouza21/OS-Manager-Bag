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

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;
    private final UserDetailsServiceImpl userDetailsService;

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

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        
        configuration.setAllowedOrigins(Arrays.asList(
            "http://192.168.56.1:5173",
            "http://localhost:5173"
        ));
        
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        
        configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type"));
        
        configuration.setAllowCredentials(true);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(authorize -> authorize
                        // 1. Endpoints PÚBLICOS
                        .requestMatchers("/api/auth/**").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/funcionarios/register").permitAll()
                        .requestMatchers("/error").permitAll()

                        // 2. Endpoints ESPECÍFICOS de Ordem de Serviço (do mais específico para o mais geral)
                        .requestMatchers(HttpMethod.PUT, "/api/ordens-servico/*/ciencia").hasRole("LIDER")
                        .requestMatchers(HttpMethod.PUT, "/api/ordens-servico/*/status").hasAnyRole("ADMIN", "MECANICO", "ANALISTA_CQ", "LIDER")
                        .requestMatchers(HttpMethod.PUT, "/api/ordens-servico/*/execucao").hasRole("MECANICO")
                        .requestMatchers(HttpMethod.PUT, "/api/ordens-servico/*/verificacao-cq").hasRole("ANALISTA_CQ")
                        .requestMatchers(HttpMethod.PUT, "/api/ordens-servico/*/aprovacao").hasRole("LIDER")
                        
                        // 3. Outros endpoints com regras de ROLE
                        .requestMatchers(HttpMethod.POST, "/api/funcionarios").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.POST, "/api/equipamentos").hasAnyRole("ADMIN", "MECANICO")
                        
                        // 4. Regra GERAL (última a ser avaliada)
                        .anyRequest().authenticated()
                )
                .authenticationProvider(authenticationProvider())
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}