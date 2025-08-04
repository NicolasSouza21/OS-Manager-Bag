package com.bag.osmanager.service;

import com.bag.osmanager.dto.SetorDTO;
import com.bag.osmanager.exception.DataIntegrityException;
import com.bag.osmanager.exception.ResourceNotFoundException;
import com.bag.osmanager.model.Setor;
import com.bag.osmanager.repository.SetorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.BeanUtils;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SetorService {

    private final SetorRepository setorRepository;

    public List<SetorDTO> listarTodos() {
        return setorRepository.findAll().stream()
                .map(this::converterParaDTO)
                .collect(Collectors.toList());
    }

    public SetorDTO criar(SetorDTO dto) {
        Setor setor = new Setor();
        BeanUtils.copyProperties(dto, setor, "id");
        Setor salvo = setorRepository.save(setor);
        return converterParaDTO(salvo);
    }

    public SetorDTO atualizar(Long id, SetorDTO dto) {
        Setor setor = setorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Setor não encontrado com o ID: " + id));
        
        BeanUtils.copyProperties(dto, setor, "id");
        Setor salvo = setorRepository.save(setor);
        return converterParaDTO(salvo);
    }

    public void deletar(Long id) {
        if (!setorRepository.existsById(id)) {
            throw new ResourceNotFoundException("Setor não encontrado com o ID: " + id);
        }
        try {
            setorRepository.deleteById(id);
        } catch (DataIntegrityViolationException e) {
            // Lança uma exceção mais amigável se o setor estiver em uso por algum local
            throw new DataIntegrityException("Não é possível excluir o setor, pois ele já está associado a um ou mais locais.");
        }
    }

    private SetorDTO converterParaDTO(Setor setor) {
        SetorDTO dto = new SetorDTO();
        BeanUtils.copyProperties(setor, dto);
        return dto;
    }
}