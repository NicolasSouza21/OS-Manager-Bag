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
@RequestMapping("/api/frequencias")
@RequiredArgsConstructor
public class FrequenciaController {

    private final FrequenciaService frequenciaService;

    @GetMapping
    public ResponseEntity<List<FrequenciaDTO>> getAllFrequencias() {
        List<FrequenciaDTO> frequencias = frequenciaService.getAllFrequencias();
        return ResponseEntity.ok(frequencias);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ResponseEntity<FrequenciaDTO> createFrequencia(@Valid @RequestBody FrequenciaDTO frequenciaDTO) {
        FrequenciaDTO novaFrequencia = frequenciaService.createFrequencia(frequenciaDTO);
        return new ResponseEntity<>(novaFrequencia, HttpStatus.CREATED);
    }

    // ✨ ALTERAÇÃO AQUI: Novo endpoint para atualizar uma frequência
    /**
     * Endpoint para atualizar uma frequência existente.
     * Mapeado para PUT /api/frequencias/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<FrequenciaDTO> updateFrequencia(@PathVariable Long id, @Valid @RequestBody FrequenciaDTO frequenciaDTO) {
        FrequenciaDTO frequenciaAtualizada = frequenciaService.updateFrequencia(id, frequenciaDTO);
        return ResponseEntity.ok(frequenciaAtualizada);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public ResponseEntity<Void> deleteFrequencia(@PathVariable Long id) {
        frequenciaService.deleteFrequencia(id);
        return ResponseEntity.noContent().build();
    }
}