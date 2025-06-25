// Local do arquivo: src/main/java/com/bag/osmanager/controller/OrdemServicoController.java
package com.bag.osmanager.controller;

import com.bag.osmanager.dto.*;
import com.bag.osmanager.model.enums.Prioridade;
import com.bag.osmanager.model.enums.StatusVerificacao;
import com.bag.osmanager.model.enums.Turno;
import com.bag.osmanager.service.OrdemServicoService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ordens-servico")
@RequiredArgsConstructor
public class OrdemServicoController {

    private final OrdemServicoService osService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'LIDER')")
    public ResponseEntity<OrdemServicoDTO> criarOS(@RequestBody CriarOrdemServicoDTO dto) {
        OrdemServicoDTO osCriada = osService.criarOS(dto);
        return new ResponseEntity<>(osCriada, HttpStatus.CREATED);
    }

    // 👇 O MÉTODO "listarTodas" FOI COMPLETAMENTE SUBSTITUÍDO POR ESTE 👇
    @GetMapping
    public ResponseEntity<Page<OrdemServicoDTO>> buscarComFiltros(
            // Parâmetros de filtro (não obrigatórios)
            @RequestParam(required = false) String numeroMaquina,
            @RequestParam(required = false) Prioridade prioridade,
            @RequestParam(required = false) StatusVerificacao status,
            @RequestParam(required = false) Turno turno,

            // Parâmetros de paginação e ordenação com valores padrão
            @PageableDefault(size = 10, sort = "dataSolicitacao", direction = Sort.Direction.DESC) Pageable pageable) {

        Page<OrdemServicoDTO> pagina = osService.buscarComFiltros(numeroMaquina, prioridade, status, turno, pageable);
        return ResponseEntity.ok(pagina);
    }

    @GetMapping("/{id}")
    public ResponseEntity<OrdemServicoDTO> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(osService.buscarPorId(id));
    }

    @PutMapping("/{id}/ciencia")
    @PreAuthorize("hasRole('MECANICO')")
    public ResponseEntity<OrdemServicoDTO> registrarCiencia(@PathVariable Long id, @RequestBody CienciaDTO dto) {
        return ResponseEntity.ok(osService.registrarCiencia(id, dto));
    }

    @PutMapping("/{id}/execucao")
    @PreAuthorize("hasRole('MECANICO')")
    public ResponseEntity<OrdemServicoDTO> registrarExecucao(@PathVariable Long id, @RequestBody ExecucaoDTO dto) {
        return ResponseEntity.ok(osService.registrarExecucao(id, dto));
    }

    @PutMapping("/{id}/verificacao-cq")
    @PreAuthorize("hasRole('ANALISTA_CQ')")
    public ResponseEntity<OrdemServicoDTO> registrarVerificacaoCQ(@PathVariable Long id, @RequestBody VerificacaoCQDTO dto) {
        return ResponseEntity.ok(osService.registrarVerificacaoCQ(id, dto));
    }

    @PutMapping("/{id}/aprovacao")
    @PreAuthorize("hasRole('LIDER')")
    public ResponseEntity<OrdemServicoDTO> registrarAprovacao(@PathVariable Long id, @RequestBody AprovacaoDTO dto) {
        return ResponseEntity.ok(osService.registrarAprovacao(id, dto));
    }
}