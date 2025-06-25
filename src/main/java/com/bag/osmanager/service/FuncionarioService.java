// Local do arquivo: src/main/java/com/bag/osmanager/service/FuncionarioService.java
package com.bag.osmanager.service;

import com.bag.osmanager.dto.FuncionarioDTO;
import com.bag.osmanager.exception.ResourceNotFoundException; // 👈 IMPORT ADICIONADO
import com.bag.osmanager.model.Funcionario;
import com.bag.osmanager.repository.FuncionarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.BeanUtils;
import org.springframework.security.crypto.password.PasswordEncoder; // 👈 IMPORT ADICIONADO
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FuncionarioService {

    private final FuncionarioRepository repository;
    private final PasswordEncoder passwordEncoder; // 👈 DEPENDÊNCIA INJETADA

    public FuncionarioDTO salvar(FuncionarioDTO dto) {
        Funcionario funcionario = new Funcionario();
        // Copia as propriedades, exceto a senha que será tratada separadamente
        BeanUtils.copyProperties(dto, funcionario, "senha"); 

        // Codifica a senha antes de salvar no banco de dados
        if (dto.getSenha() != null && !dto.getSenha().isEmpty()) {
            funcionario.setSenha(passwordEncoder.encode(dto.getSenha()));
        }

        funcionario = repository.save(funcionario);

        // Converte para DTO para o retorno, sem a senha
        return converteParaDTO(funcionario);
    }

    public List<FuncionarioDTO> listarTodos() {
        return repository.findAll().stream()
                .map(this::converteParaDTO) // Usa o método auxiliar para garantir consistência
                .collect(Collectors.toList());
    }

    public Optional<FuncionarioDTO> buscarPorId(Long id) {
        // 👇 CORREÇÃO APLICADA 👇
        return repository.findById(id)
                .map(this::converteParaDTO); // Retorna um DTO sem a senha
    }

    public void deletar(Long id) {
        if (!repository.existsById(id)) {
            // Lança exceção se tentar deletar um funcionário que não existe
            throw new ResourceNotFoundException("Funcionário com ID " + id + " não encontrado para deleção.");
        }
        repository.deleteById(id);
    }

    public FuncionarioDTO atualizar(Long id, FuncionarioDTO dto) {
        // 👇 CORREÇÃO APLICADA 👇
        Funcionario funcionario = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Funcionário com ID " + id + " não encontrado para atualização."));

        // Copia as propriedades, ignorando o ID e a senha
        BeanUtils.copyProperties(dto, funcionario, "id", "senha");

        // Permite a atualização da senha apenas se uma nova for fornecida
        if (dto.getSenha() != null && !dto.getSenha().trim().isEmpty()) {
            funcionario.setSenha(passwordEncoder.encode(dto.getSenha()));
        }

        funcionario = repository.save(funcionario);
        
        // Converte para DTO para o retorno, sem a senha
        return converteParaDTO(funcionario);
    }

    // Método auxiliar para converter Entidade para DTO sem expor a senha
    private FuncionarioDTO converteParaDTO(Funcionario funcionario) {
        FuncionarioDTO dto = new FuncionarioDTO();
        BeanUtils.copyProperties(funcionario, dto, "senha"); // NUNCA copie a senha para o DTO
        return dto;
    }
}