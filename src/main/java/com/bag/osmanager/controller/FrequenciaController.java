package com.bag.osmanager.controller;

import com.bag.osmanager.dto.FrequenciaDTO;
import com.bag.osmanager.service.FrequenciaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller para expor os endpoints da API REST para Frequências.
 */
@RestController
@RequestMapping("/api/frequencias") // Define o prefixo da URL para todos os endpoints nesta classe
@RequiredArgsConstructor
public class FrequenciaController {

    private final FrequenciaService frequenciaService;

    /**
     * Endpoint para buscar todas as frequências.
     * Mapeado para GET /api/frequencias
     */
    @GetMapping
    public ResponseEntity<List<FrequenciaDTO>> getAllFrequencias() {
        List<FrequenciaDTO> frequencias = frequenciaService.getAllFrequencias();
        return ResponseEntity.ok(frequencias);
    }

    /**
     * Endpoint para criar uma nova frequência.
     * Mapeado para POST /api/frequencias
     */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED) // Retorna o status 201 Created em caso de sucesso
    public ResponseEntity<FrequenciaDTO> createFrequencia(@Valid @RequestBody FrequenciaDTO frequenciaDTO) {
        FrequenciaDTO novaFrequencia = frequenciaService.createFrequencia(frequenciaDTO);
        return new ResponseEntity<>(novaFrequencia, HttpStatus.CREATED);
    }

    /**
     * Endpoint para deletar uma frequência.
     * Mapeado para DELETE /api/frequencias/{id}
     */
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT) // Retorna o status 204 No Content em caso de sucesso
    public ResponseEntity<Void> deleteFrequencia(@PathVariable Long id) {
        frequenciaService.deleteFrequencia(id);
        return ResponseEntity.noContent().build();
    }
}