package com.bag.osmanager.controller;

import com.bag.osmanager.dto.LocalDTO;
import com.bag.osmanager.service.LocalService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/locais")
@RequiredArgsConstructor
public class LocalController {

    private final LocalService localService;

    @GetMapping
    public List<LocalDTO> listarTodos() {
        return localService.listarTodos();
    }

    @PostMapping
    public ResponseEntity<LocalDTO> criar(@RequestBody LocalDTO dto) {
        LocalDTO salvo = localService.criar(dto);
        return ResponseEntity.status(201).body(salvo);
    }

    @PutMapping("/{id}")
    public ResponseEntity<LocalDTO> atualizar(@PathVariable Long id, @RequestBody LocalDTO dto) {
        LocalDTO atualizado = localService.atualizar(id, dto);
        return ResponseEntity.ok(atualizado);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        localService.deletar(id);
        return ResponseEntity.noContent().build();
    }
}