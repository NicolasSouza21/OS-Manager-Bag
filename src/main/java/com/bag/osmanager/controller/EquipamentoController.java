package com.bag.osmanager.controller;

import com.bag.osmanager.dto.EquipamentoDTO;
import com.bag.osmanager.service.EquipamentoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller para expor os endpoints da API relacionados a Equipamentos.
 */
@RestController
@RequestMapping("/api/equipamentos")
@RequiredArgsConstructor
public class EquipamentoController {

    private final EquipamentoService equipamentoService;

    /**
     * Endpoint para listar todos os equipamentos cadastrados.
     * GET /api/equipamentos
     */
    @GetMapping
    public ResponseEntity<List<EquipamentoDTO>> listarTodosEquipamentos() {
        List<EquipamentoDTO> equipamentos = equipamentoService.listarTodos();
        return ResponseEntity.ok(equipamentos);
    }

    /**
     * Endpoint para cadastrar um novo equipamento.
     * POST /api/equipamentos
     */
    @PostMapping
    public ResponseEntity<EquipamentoDTO> cadastrarEquipamento(@RequestBody EquipamentoDTO equipamentoDTO) {
        EquipamentoDTO salvo = equipamentoService.cadastrar(equipamentoDTO);
        return ResponseEntity.ok(salvo);
    }
}