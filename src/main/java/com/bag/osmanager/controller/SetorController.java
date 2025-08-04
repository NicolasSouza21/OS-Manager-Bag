package com.bag.osmanager.controller;

import com.bag.osmanager.dto.SetorDTO; // ✨ ALTERAÇÃO AQUI: DTO específico para Setor
import com.bag.osmanager.service.SetorService; // ✨ ALTERAÇÃO AQUI: Serviço específico para Setor
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

import java.util.List;

@RestController
@RequestMapping("/api/setores") // ✨ ALTERAÇÃO AQUI: Rota base para setores
@RequiredArgsConstructor
public class SetorController {

    private final SetorService setorService; // ✨ ALTERAÇÃO AQUI: Injeta o serviço de setor

    @GetMapping
    public ResponseEntity<List<SetorDTO>> listarTodos() {
        return ResponseEntity.ok(setorService.listarTodos());
    }

    @PostMapping
    public ResponseEntity<SetorDTO> criar(@Valid @RequestBody SetorDTO dto) {
        SetorDTO salvo = setorService.criar(dto);
        return ResponseEntity.status(201).body(salvo);
    }

    @PutMapping("/{id}")
    public ResponseEntity<SetorDTO> atualizar(@PathVariable Long id, @Valid @RequestBody SetorDTO dto) {
        SetorDTO atualizado = setorService.atualizar(id, dto);
        return ResponseEntity.ok(atualizado);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        setorService.deletar(id);
        return ResponseEntity.noContent().build();
    }
}