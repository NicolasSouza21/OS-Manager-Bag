package com.bag.osmanager.service;

import com.bag.osmanager.dto.AuthRequestDTO;
import com.bag.osmanager.dto.AuthResponseDTO;
import com.bag.osmanager.dto.FuncionarioDTO; // Importa o FuncionarioDTO
import com.bag.osmanager.model.Funcionario;
import com.bag.osmanager.repository.FuncionarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.BeanUtils;
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
        // Autentica o utilizador
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getSenha())
        );

        // Busca o funcionário completo do banco de dados
        Funcionario funcionario = funcionarioRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new UsernameNotFoundException("Utilizador não encontrado com o email: " + request.getEmail()));

        // Gera o token JWT
        String token = jwtService.generateToken(funcionario);
        
        // --- 👇👇 LÓGICA CORRIGIDA AQUI 👇👇 ---

        // 1. Cria um FuncionarioDTO para ser enviado na resposta
        FuncionarioDTO userInfo = new FuncionarioDTO();
        BeanUtils.copyProperties(funcionario, userInfo);
        
        // 2. Remove a senha do DTO por segurança!
        userInfo.setSenha(null);

        System.out.println("******************************************************");
        System.out.println("AUTENTICAÇÃO BEM-SUCEDIDA PARA: " + request.getEmail() + " | CARGO: " + userInfo.getTipoFuncionario());
        System.out.println("******************************************************");

        // 3. Retorna o DTO de resposta com o token e as informações do utilizador
        return new AuthResponseDTO(token, userInfo);
    }
}