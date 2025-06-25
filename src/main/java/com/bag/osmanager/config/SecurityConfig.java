// Crie a pasta 'config' em: src/main/java/com/bag/osmanager/config/
// E dentro dela, crie o arquivo SecurityConfig.java

package com.bag.osmanager.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        // Sempre use um codificador de senhas forte como o BCrypt
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            // Desabilita o CSRF, pois não usaremos sessões (comum em APIs REST com JWT)
            .csrf(csrf -> csrf.disable())
            
            // Configura a política de sessão para STATELESS, pois o React vai gerenciar o token
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            
            .authorizeHttpRequests(authorize -> authorize
                // 👇 Permite que qualquer um acesse o endpoint de criar funcionário (para o 1º admin) e de login
                .requestMatchers("/api/funcionarios", "/api/auth/login").permitAll()
                
                // 👇 Exige autenticação para qualquer outra requisição
                .anyRequest().authenticated()
            );

        return http.build();
    }
}