package com.bag.osmanager.controller;

import com.bag.osmanager.dto.TipoServicoDTO;
import com.bag.osmanager.service.TipoServicoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tipos-servico")
@RequiredArgsConstructor
public class TipoServicoController {

    private final TipoServicoService tipoServicoService;

    // Lista todos os tipos de serviço cadastrados
    @GetMapping
    public ResponseEntity<List<TipoServicoDTO>> listarTodos() {
        return ResponseEntity.ok(tipoServicoService.listarTodos());
    }

    // Cria um novo tipo de serviço
    @PostMapping
    public ResponseEntity<TipoServicoDTO> criar(@RequestBody TipoServicoDTO dto) {
        TipoServicoDTO novoServico = tipoServicoService.criar(dto);
        return new ResponseEntity<>(novoServico, HttpStatus.CREATED);
    }

    // Deleta um tipo de serviço
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        tipoServicoService.deletar(id);
        return ResponseEntity.noContent().build();
    }
}