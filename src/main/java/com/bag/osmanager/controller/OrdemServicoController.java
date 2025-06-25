// Crie este arquivo em: src/main/java/com/bag/osmanager/controller/OrdemServicoController.java
package com.bag.osmanager.controller;

import com.bag.osmanager.dto.*;
import com.bag.osmanager.service.OrdemServicoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ordens-servico")
@RequiredArgsConstructor
public class OrdemServicoController {

    private final OrdemServicoService osService;

    // Endpoint para criar uma nova OS
    // POST /api/ordens-servico
    @PostMapping
    public ResponseEntity<OrdemServicoDTO> criarOS(@RequestBody CriarOrdemServicoDTO dto) {
        OrdemServicoDTO osCriada = osService.criarOS(dto);
        return new ResponseEntity<>(osCriada, HttpStatus.CREATED);
    }

    // Endpoint para listar todas as OS
    // GET /api/ordens-servico
    @GetMapping
    public ResponseEntity<List<OrdemServicoDTO>> listarTodas() {
        return ResponseEntity.ok(osService.listarTodas());
    }

    // Endpoint para buscar uma OS por ID
    // GET /api/ordens-servico/{id}
    @GetMapping("/{id}")
    public ResponseEntity<OrdemServicoDTO> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(osService.buscarPorId(id));
    }

    // Endpoint para registrar a ciência do mecânico
    // PUT /api/ordens-servico/{id}/ciencia
    @PutMapping("/{id}/ciencia")
    public ResponseEntity<OrdemServicoDTO> registrarCiencia(@PathVariable Long id, @RequestBody CienciaDTO dto) {
        return ResponseEntity.ok(osService.registrarCiencia(id, dto));
    }

    // Endpoint para registrar a execução da OS
    // PUT /api/ordens-servico/{id}/execucao
    @PutMapping("/{id}/execucao")
    public ResponseEntity<OrdemServicoDTO> registrarExecucao(@PathVariable Long id, @RequestBody ExecucaoDTO dto) {
        return ResponseEntity.ok(osService.registrarExecucao(id, dto));
    }

    // Endpoint para registrar a verificação do CQ
    // PUT /api/ordens-servico/{id}/verificacao-cq
    @PutMapping("/{id}/verificacao-cq")
    public ResponseEntity<OrdemServicoDTO> registrarVerificacaoCQ(@PathVariable Long id, @RequestBody VerificacaoCQDTO dto) {
        return ResponseEntity.ok(osService.registrarVerificacaoCQ(id, dto));
    }

    // Endpoint para registrar a aprovação do líder
    // PUT /api/ordens-servico/{id}/aprovacao
    @PutMapping("/{id}/aprovacao")
    public ResponseEntity<OrdemServicoDTO> registrarAprovacao(@PathVariable Long id, @RequestBody AprovacaoDTO dto) {
        return ResponseEntity.ok(osService.registrarAprovacao(id, dto));
    }
}