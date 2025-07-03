// Local: src/main/java/com/bag/osmanager/config/SecurityConfig.java
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

import java.util.List;

import static org.springframework.security.config.Customizer.withDefaults;

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
        configuration.setAllowedOrigins(List.of("http://localhost:5173", "http://192.168.0.11:5173", "http://192.168.56.1:5173"));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("Authorization", "Content-Type", "X-Requested-With"));
        configuration.setAllowCredentials(true);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .cors(withDefaults())
            .csrf(csrf -> csrf.disable())
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(authorize -> authorize
                // --- 👇👇 LINHA CRUCIAL ADICIONADA AQUI 👇👇 ---
                // Permite todas as requisições de verificação (pre-flight) do CORS.
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                
                // Suas regras públicas
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/funcionarios").permitAll()
                
                // O resto das suas regras de negócio
                .requestMatchers(HttpMethod.POST, "/api/locais").hasAnyRole("ADMIN", "MECANICO", "LIDER")
                .requestMatchers(HttpMethod.GET, "/api/locais").authenticated()
                .requestMatchers(HttpMethod.PUT, "/api/locais/**").hasAnyRole("ADMIN", "MECANICO", "LIDER")
                .requestMatchers(HttpMethod.DELETE, "/api/locais/**").hasAnyRole("ADMIN", "MECANICO", "LIDER")
                .requestMatchers(HttpMethod.POST, "/api/equipamentos").hasAnyRole("ADMIN", "MECANICO", "LIDER")
                .requestMatchers(HttpMethod.POST, "/api/ordens-servico").authenticated()
                .requestMatchers(HttpMethod.PUT, "/api/ordens-servico/*/status").hasAnyRole("ADMIN", "MECANICO", "ANALISTA_QC")
                .requestMatchers(HttpMethod.PATCH, "/api/ordens-servico/*/ciencia-lider").hasRole("LIDER")
                
                // Qualquer outra requisição precisa de autenticação
                .anyRequest().authenticated()
            )
            .authenticationProvider(authenticationProvider())
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}