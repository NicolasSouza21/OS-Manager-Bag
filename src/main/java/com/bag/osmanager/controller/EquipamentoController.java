package com.bag.osmanager.controller;

import com.bag.osmanager.dto.EquipamentoDTO;
import com.bag.osmanager.dto.TipoServicoDTO; // ✅ Importe o DTO de serviço
import com.bag.osmanager.service.EquipamentoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Set; // ✅ Importe o Set

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

    // Buscar por ID
    @GetMapping("/{id}")
    public ResponseEntity<EquipamentoDTO> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(equipamentoService.buscarPorId(id));
    }

    // Cadastrar novo
    @PostMapping
    public ResponseEntity<EquipamentoDTO> cadastrarEquipamento(@RequestBody EquipamentoDTO equipamentoDTO) {
        EquipamentoDTO salvo = equipamentoService.cadastrar(equipamentoDTO);
        return ResponseEntity.ok(salvo);
    }

    // Atualizar
    @PutMapping("/{id}")
    public ResponseEntity<EquipamentoDTO> atualizarEquipamento(
            @PathVariable Long id,
            @RequestBody EquipamentoDTO equipamentoDTO) {
        EquipamentoDTO atualizado = equipamentoService.atualizar(id, equipamentoDTO);
        return ResponseEntity.ok(atualizado);
    }

    // Excluir
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletarEquipamento(@PathVariable Long id) {
        equipamentoService.deletar(id);
        return ResponseEntity.noContent().build();
    }
    
    // --- ✅ NOVOS ENDPOINTS PARA GERENCIAR SERVIÇOS DO EQUIPAMENTO ---

    /**
     * Lista todos os serviços disponíveis para um equipamento específico.
     */
    @GetMapping("/{equipamentoId}/servicos")
    public ResponseEntity<Set<TipoServicoDTO>> listarServicosPorEquipamento(@PathVariable Long equipamentoId) {
        return ResponseEntity.ok(equipamentoService.listarServicosPorEquipamento(equipamentoId));
    }

    /**
     * Associa um tipo de serviço a um equipamento.
     */
    @PostMapping("/{equipamentoId}/servicos/{servicoId}")
    public ResponseEntity<EquipamentoDTO> associarServico(
            @PathVariable Long equipamentoId,
            @PathVariable Long servicoId) {
        return ResponseEntity.ok(equipamentoService.associarServico(equipamentoId, servicoId));
    }

    /**
     * Desassocia um tipo de serviço de um equipamento.
     */
    @DeleteMapping("/{equipamentoId}/servicos/{servicoId}")
    public ResponseEntity<Void> desassociarServico(
            @PathVariable Long equipamentoId,
            @PathVariable Long servicoId) {
        equipamentoService.desassociarServico(equipamentoId, servicoId);
        return ResponseEntity.noContent().build();
    }
}