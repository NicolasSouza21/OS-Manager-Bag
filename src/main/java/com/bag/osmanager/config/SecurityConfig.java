package com.bag.osmanager.config;

import com.bag.osmanager.config.filter.JwtAuthFilter;
import com.bag.osmanager.service.UserDetailsServiceImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpMethod; 
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
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
     public PasswordEncoder passwordEncoder() { return new BCryptPasswordEncoder(); }

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
         // ✨ ALTERAÇÃO: Ao rodar tudo junto no .jar, a origem é a mesma, mas mantemos localhost para dev
         configuration.setAllowedOrigins(Arrays.asList("http://localhost:5173", "http://192.168.0.11:5173", "http://192.168.56.1:5173", "http://localhost:8080"));
         configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
         configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type", "Cache-Control"));
         configuration.setAllowCredentials(true);
         UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
         source.registerCorsConfiguration("/**", configuration);
         return source;
     }


    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(AbstractHttpConfigurer::disable)
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

            .authorizeHttpRequests(authorize -> authorize
                // 0. Permite todas as requisições de verificação (preflight) OPTIONS
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                // ✨ ALTERAÇÃO AQUI: Permissões para Arquivos Estáticos do Frontend (React build)
                // Isso permite que o navegador baixe o HTML/JS/CSS antes de logar
                .requestMatchers(
                    "/", 
                    "/index.html", 
                    "/assets/**", 
                    "/*.ico", 
                    "/*.png", 
                    "/*.svg", 
                    "/*.json", 
                    "/*.js", 
                    "/*.css"
                ).permitAll()

                // ✨ ALTERAÇÃO AQUI: Permite que rotas do React (SPA) sejam acessadas sem token inicial
                // (O React vai checar o token internamente e redirecionar para login se necessário)
                .requestMatchers(
                    "/login", 
                    "/dashboard", 
                    "/calendario", 
                    "/criar-os", 
                    "/relatorios",
                    "/os/**",      // Visualização de OS
                    "/admin/**"    // Rotas administrativas (Frontend)
                ).permitAll()

                // 1. Rotas Públicas da API
                .requestMatchers("/api/auth/**", "/error").permitAll()

                // 2. Gerenciamento de Funcionários: Apenas ADMIN
                .requestMatchers("/api/funcionarios/**").hasRole("ADMIN")

                // 3. Verificação de OS: Apenas Encarregado e Admin
                .requestMatchers(HttpMethod.POST, "/api/ordens-servico/*/verificar").hasAnyRole("ADMIN", "ENCARREGADO")

                // 2a. Gerenciamento de Funcionários (VISUALIZAÇÃO)
                .requestMatchers(HttpMethod.GET, "/api/funcionarios", "/api/funcionarios/**")
                    .hasAnyRole("ADMIN", "LIDER", "MECANICO", "ENCARREGADO")

                // 2b. Gerenciamento de Funcionários (MODIFICAÇÃO)
                .requestMatchers("/api/funcionarios/**").hasRole("ADMIN")

                // 3. Verificação de OS:
                .requestMatchers(HttpMethod.POST, "/api/ordens-servico/*/verificar")
                    .hasAnyRole("ADMIN", "ENCARREGADO", "LIDER", "ANALISTA_CQ")

                // 4. Gerenciamento de OS
                .requestMatchers("/api/ordens-servico/aprovar/**", "/api/ordens-servico/finalizar/**").hasAnyRole("ADMIN", "LIDER", "ENCARREGADO")
                .requestMatchers("/api/ordens-servico/cq/**").hasAnyRole("ADMIN", "LIDER", "ENCARREGADO", "ANALISTA_CQ")

                // 5. Gerenciamento de Equipamentos, Locais, Setores, Frequências, Tipos de Serviço e Planos Preventiva
                // ✨ ALTERAÇÃO AQUI: Permite GET para qualquer autenticado (já estava)
                .requestMatchers(HttpMethod.GET,
                    "/api/equipamentos/**",
                    "/api/locais/**",
                    "/api/setores/**", // Adicionado Setores
                    "/api/frequencias/**", // Adicionado Frequencias
                    "/api/tipos-servico/**", // Adicionado Tipos de Serviço
                    "/api/planos-preventiva/**" // Adicionado Planos Preventiva
                 ).authenticated()
                // ✨ ALTERAÇÃO AQUI: Permite POST/PUT/DELETE para ADMIN, LIDER, ENCARREGADO e ANALISTA_CQ
                .requestMatchers(
                    "/api/equipamentos/**",
                    "/api/locais/**",
                    "/api/setores/**", // Adicionado Setores
                    "/api/frequencias/**", // Adicionado Frequencias
                    "/api/tipos-servico/**", // Adicionado Tipos de Serviço
                    "/api/planos-preventiva/**" // Adicionado Planos Preventiva
                ).hasAnyRole("ADMIN", "LIDER", "ENCARREGADO", "ANALISTA_CQ")

                // 6. Regra final: Qualquer outra requisição precisa de autenticação
                .anyRequest().authenticated()
            )
            .authenticationProvider(authenticationProvider())
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}