// Local do arquivo: src/main/java/com/bag/osmanager/controller/FuncionarioController.java
package com.bag.osmanager.controller;

import com.bag.osmanager.dto.FuncionarioDTO;
import com.bag.osmanager.service.FuncionarioService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize; // 👈 IMPORT ADICIONADO
import org.springframework.web.bind.annotation.*;

import java.util.List;


@RestController
@RequestMapping("/api/funcionarios")
@RequiredArgsConstructor
public class FuncionarioController {

    private final FuncionarioService service;

    // Permitido no SecurityConfig para o primeiro acesso, mas protegido para chamadas autenticadas.
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')") // 👈 CORREÇÃO APLICADA
    public ResponseEntity<FuncionarioDTO> criar(@RequestBody FuncionarioDTO dto) {
        return ResponseEntity.ok(service.salvar(dto));
    }

    @GetMapping
    // Qualquer usuário autenticado pode listar os funcionários
    public ResponseEntity<List<FuncionarioDTO>> listar() {
        return ResponseEntity.ok(service.listarTodos());
    }

    @GetMapping("/{id}")
    // Qualquer usuário autenticado pode buscar um funcionário por ID
    public ResponseEntity<FuncionarioDTO> buscar(@PathVariable Long id) {
        return service.buscarPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')") // 👈 CORREÇÃO APLICADA
    public ResponseEntity<FuncionarioDTO> atualizar(@PathVariable Long id, @RequestBody FuncionarioDTO dto) {
        return ResponseEntity.ok(service.atualizar(id, dto));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')") // 👈 CORREÇÃO APLICADA
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        service.deletar(id);
        return ResponseEntity.noContent().build();
    }
}