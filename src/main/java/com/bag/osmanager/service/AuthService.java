// Local do ficheiro: src/main/java/com/bag/osmanager/service/AuthService.java
package com.bag.osmanager.service;

import com.bag.osmanager.dto.AuthRequestDTO;
import com.bag.osmanager.dto.AuthResponseDTO;
import com.bag.osmanager.model.Funcionario; // 👈 1. IMPORTE A ENTIDADE FUNCIONARIO
import com.bag.osmanager.repository.FuncionarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final FuncionarioRepository funcionarioRepository;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    public AuthResponseDTO login(AuthRequestDTO request) {
        // Autentica o utilizador com as credenciais fornecidas
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getSenha())
        );

        // Se a autenticação for bem-sucedida, busca o funcionário completo
        // 👇 2. ALTERADO PARA BUSCAR A ENTIDADE FUNCIONARIO DIRETAMENTE 👇
        Funcionario funcionario = funcionarioRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new UsernameNotFoundException("Utilizador não encontrado com o email: " + request.getEmail()));

        // Gera o token JWT
        String token = jwtService.generateToken(funcionario);
        
        // 👇 3. OBTÉM O CARGO (ROLE) DO FUNCIONÁRIO 👇
        String role = funcionario.getTipoFuncionario().name();

        System.out.println("******************************************************");
        System.out.println("AUTENTICAÇÃO BEM-SUCEDIDA PARA: " + request.getEmail() + " | CARGO: " + role);
        System.out.println("******************************************************");

        // 👇 4. RETORNA O DTO COM O TOKEN E O CARGO 👇
        return new AuthResponseDTO(token, role);
    }
}