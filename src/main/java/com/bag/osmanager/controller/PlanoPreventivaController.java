package com.bag.osmanager.controller;

import com.bag.osmanager.dto.PlanoPreventivaDTO;
import com.bag.osmanager.service.PlanoPreventivaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import com.bag.osmanager.dto.ProgramacaoManutencaoDTO; // ✨ ALTERAÇÃO AQUI

@RestController
@RequestMapping("/api/planos-preventiva")
@RequiredArgsConstructor
public class PlanoPreventivaController {

    private final PlanoPreventivaService planoPreventivaService;

    // ✨ ALTERAÇÃO AQUI: Novo endpoint para a programação de manutenção
    @GetMapping("/programacao/{equipamentoId}")
    public ResponseEntity<List<ProgramacaoManutencaoDTO>> getProgramacaoManutencao(@PathVariable Long equipamentoId) {
        List<ProgramacaoManutencaoDTO> programacao = planoPreventivaService.getProgramacaoManutencao(equipamentoId);
        return ResponseEntity.ok(programacao);
    }

    // Adiciona um novo plano de manutenção
    @PostMapping
    public ResponseEntity<PlanoPreventivaDTO> adicionarPlano(@RequestBody PlanoPreventivaDTO dto) {
        PlanoPreventivaDTO planoSalvo = planoPreventivaService.adicionarPlano(dto);
        return new ResponseEntity<>(planoSalvo, HttpStatus.CREATED);
    }

    // Lista todos os planos de um equipamento específico
    @GetMapping("/equipamento/{equipamentoId}")
    public ResponseEntity<List<PlanoPreventivaDTO>> listarPlanosPorEquipamento(@PathVariable Long equipamentoId) {
        List<PlanoPreventivaDTO> planos = planoPreventivaService.listarPlanosPorEquipamento(equipamentoId);
        return ResponseEntity.ok(planos);
    }

    // Atualiza um plano de manutenção
    @PutMapping("/{planoId}")
    public ResponseEntity<PlanoPreventivaDTO> atualizarPlano(@PathVariable Long planoId, @RequestBody PlanoPreventivaDTO dto) {
        PlanoPreventivaDTO planoAtualizado = planoPreventivaService.atualizarPlano(planoId, dto);
        return ResponseEntity.ok(planoAtualizado);
    }

    // Deleta um plano de manutenção
    @DeleteMapping("/{planoId}")
    public ResponseEntity<Void> deletarPlano(@PathVariable Long planoId) {
        planoPreventivaService.deletarPlano(planoId);
        return ResponseEntity.noContent().build();
    }
}