// Crie este arquivo em: src/main/java/com/bag/osmanager/service/AuthService.java
package com.bag.osmanager.service;

import com.bag.osmanager.dto.AuthRequestDTO;
import com.bag.osmanager.dto.AuthResponseDTO;
import com.bag.osmanager.repository.FuncionarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final FuncionarioRepository funcionarioRepository;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    public AuthResponseDTO login(AuthRequestDTO request) {
        // Autentica o usuário com as credenciais fornecidas
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getSenha())
        );

        // Se a autenticação for bem-sucedida, busca o usuário e gera o token
        final UserDetails user = funcionarioRepository.findByEmail(request.getEmail()).orElseThrow();
        String token = jwtService.generateToken(user);

        return new AuthResponseDTO(token);
    }
}