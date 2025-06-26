package com.bag.osmanager.controller;

import com.bag.osmanager.dto.EquipamentoDTO;
import com.bag.osmanager.service.EquipamentoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Controller para expor os endpoints da API relacionados a Equipamentos.
 */
@RestController
@RequestMapping("/api/equipamentos") // Todas as rotas aqui começarão com /api/equipamentos
@RequiredArgsConstructor
public class EquipamentoController {

    // Injetamos o serviço que contém a lógica de negócio
    private final EquipamentoService equipamentoService;

    /**
     * Endpoint para listar todos os equipamentos cadastrados.
     * Acessível via GET /api/equipamentos
     * @return Uma resposta HTTP 200 (OK) com a lista de equipamentos no corpo.
     */
    @GetMapping
    public ResponseEntity<List<EquipamentoDTO>> listarTodosEquipamentos() {
        // Chama o método do serviço para buscar os dados
        List<EquipamentoDTO> equipamentos = equipamentoService.listarTodos();
        // Retorna os dados com um status de sucesso
        return ResponseEntity.ok(equipamentos);
    }
}
