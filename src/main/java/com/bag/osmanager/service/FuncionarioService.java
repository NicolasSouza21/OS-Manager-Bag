package com.bag.osmanager.service;

import com.bag.osmanager.dto.FuncionarioDTO;
import com.bag.osmanager.model.Funcionario;
import com.bag.osmanager.repository.FuncionarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FuncionarioService {

    private final FuncionarioRepository repository;

    public FuncionarioDTO salvar(FuncionarioDTO dto) {
        Funcionario funcionario = new Funcionario();
        BeanUtils.copyProperties(dto, funcionario);
        funcionario = repository.save(funcionario);

        FuncionarioDTO retorno = new FuncionarioDTO();
        BeanUtils.copyProperties(funcionario, retorno);
        return retorno;
    }

    public List<FuncionarioDTO> listarTodos() {
        return repository.findAll().stream().map(func -> {
            FuncionarioDTO dto = new FuncionarioDTO();
            BeanUtils.copyProperties(func, dto);
            return dto;
        }).collect(Collectors.toList());
    }

    public Optional<FuncionarioDTO> buscarPorId(Long id) {
        return repository.findById(id).map(func -> {
            FuncionarioDTO dto = new FuncionarioDTO();
            BeanUtils.copyProperties(func, dto);
            return dto;
        });
    }

    public void deletar(Long id) {
        repository.deleteById(id);
    }

    public FuncionarioDTO atualizar(Long id, FuncionarioDTO dto) {
        Funcionario funcionario = repository.findById(id).orElseThrow(() ->
                new RuntimeException("Funcionário não encontrado"));

        BeanUtils.copyProperties(dto, funcionario, "id");
        funcionario = repository.save(funcionario);

        FuncionarioDTO retorno = new FuncionarioDTO();
        BeanUtils.copyProperties(funcionario, retorno);
        return retorno;
    }
}
