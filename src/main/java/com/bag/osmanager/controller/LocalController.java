package com.bag.osmanager.controller;

import com.bag.osmanager.dto.LocalDTO;
import com.bag.osmanager.service.LocalService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Controller para expor os endpoints da API relacionados a Locais.
 */
@RestController
@RequestMapping("/api/locais") // Todas as rotas aqui começarão com /api/locais
@RequiredArgsConstructor
public class LocalController {

    // Injetamos o serviço que contém a lógica de negócio
    private final LocalService localService;

    /**
     * Endpoint para listar todos os locais cadastrados.
     * Acessível via GET /api/locais
     * @return Uma resposta HTTP 200 (OK) com a lista de locais no corpo.
     */
    @GetMapping
    public ResponseEntity<List<LocalDTO>> listarTodosLocais() {
        List<LocalDTO> locais = localService.listarTodos();
        return ResponseEntity.ok(locais);
    }
}
