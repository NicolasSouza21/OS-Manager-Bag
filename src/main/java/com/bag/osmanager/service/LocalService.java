package com.bag.osmanager.service;

import com.bag.osmanager.dto.LocalDTO;
import com.bag.osmanager.exception.ResourceNotFoundException;
import com.bag.osmanager.model.Local;
import com.bag.osmanager.model.Setor;
import com.bag.osmanager.repository.LocalRepository;
import com.bag.osmanager.repository.SetorRepository; // ✨ ALTERAÇÃO AQUI: Import do repositório de Setor
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LocalService {

    private final LocalRepository localRepository;
    private final SetorRepository setorRepository; // ✨ ALTERAÇÃO AQUI: Injeção da dependência

    @Transactional(readOnly = true)
    public List<LocalDTO> listarTodos() {
        return localRepository.findAll().stream()
                .map(this::converterParaDTO)
                .collect(Collectors.toList());
    }

    // ✨ ALTERAÇÃO AQUI: Lógica de criação totalmente refeita
    @Transactional
    public LocalDTO criar(LocalDTO dto) {
        // 1. Busca a entidade Setor pelo ID fornecido no DTO
        Setor setor = setorRepository.findById(dto.getSetorId())
                .orElseThrow(() -> new ResourceNotFoundException("Setor com ID " + dto.getSetorId() + " não encontrado."));

        // 2. Cria a nova entidade Local
        Local local = new Local();
        local.setNome(dto.getNome());
        local.setSetor(setor); // 3. Associa a entidade Setor ao novo Local

        Local salvo = localRepository.save(local);
        return converterParaDTO(salvo);
    }
    
    // ✨ ALTERAÇÃO AQUI: Lógica de atualização totalmente refeita
    @Transactional
    public LocalDTO atualizar(Long id, LocalDTO dto) {
        // 1. Busca o Local existente
        Local local = localRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Local não encontrado com id: " + id));

        // 2. Busca o novo Setor (caso tenha sido alterado)
        Setor setor = setorRepository.findById(dto.getSetorId())
                .orElseThrow(() -> new ResourceNotFoundException("Setor com ID " + dto.getSetorId() + " não encontrado."));

        // 3. Atualiza os dados do Local
        local.setNome(dto.getNome());
        local.setSetor(setor);

        Local salvo = localRepository.save(local);
        return converterParaDTO(salvo);
    }

    @Transactional
    public void deletar(Long id) {
        if (!localRepository.existsById(id)) {
            throw new ResourceNotFoundException("Local não encontrado com id: " + id);
        }
        localRepository.deleteById(id);
    }

    // ✨ ALTERAÇÃO AQUI: Método de conversão atualizado para a nova estrutura do DTO
    private LocalDTO converterParaDTO(Local local) {
        LocalDTO dto = new LocalDTO();
        dto.setId(local.getId());
        dto.setNome(local.getNome());
        if (local.getSetor() != null) {
            dto.setSetorId(local.getSetor().getId());
            dto.setSetorNome(local.getSetor().getNome());
        }
        return dto;
    }
}