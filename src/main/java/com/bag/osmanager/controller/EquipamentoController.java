package com.bag.osmanager.controller;

import com.bag.osmanager.dto.EquipamentoDTO;
import com.bag.osmanager.service.EquipamentoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/equipamentos")
@RequiredArgsConstructor
public class EquipamentoController {

    private final EquipamentoService equipamentoService;

    // Listar todos
    @GetMapping
    public ResponseEntity<List<EquipamentoDTO>> listarTodosEquipamentos() {
        List<EquipamentoDTO> equipamentos = equipamentoService.listarTodos();
        return ResponseEntity.ok(equipamentos);
    }

    // Buscar por ID (opcional, mas útil)
    @GetMapping("/{id}")
    public ResponseEntity<EquipamentoDTO> buscarPorId(@PathVariable Long id) {
        EquipamentoDTO equip = equipamentoService.buscarPorId(id);
        if (equip != null) {
            return ResponseEntity.ok(equip);
        }
        return ResponseEntity.notFound().build();
    }

    // Cadastrar novo
    @PostMapping
    public ResponseEntity<EquipamentoDTO> cadastrarEquipamento(@RequestBody EquipamentoDTO equipamentoDTO) {
        EquipamentoDTO salvo = equipamentoService.cadastrar(equipamentoDTO);
        return ResponseEntity.ok(salvo);
    }

    // Atualizar (PUT /api/equipamentos/{id})
    @PutMapping("/{id}")
    public ResponseEntity<EquipamentoDTO> atualizarEquipamento(
            @PathVariable Long id,
            @RequestBody EquipamentoDTO equipamentoDTO) {
        EquipamentoDTO atualizado = equipamentoService.atualizar(id, equipamentoDTO);
        if (atualizado != null) {
            return ResponseEntity.ok(atualizado);
        }
        return ResponseEntity.notFound().build();
    }

    // Excluir (DELETE /api/equipamentos/{id})
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletarEquipamento(@PathVariable Long id) {
        boolean removido = equipamentoService.deletar(id);
        if (removido) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}