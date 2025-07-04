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

    @GetMapping
    public ResponseEntity<Page<OrdemServicoDTO>> buscarComFiltros(
            @RequestParam(required = false) String numeroMaquina,
            @RequestParam(required = false) Prioridade prioridade,
            @RequestParam(required = false) StatusVerificacao status,
            @RequestParam(required = false) Turno turno,
            @PageableDefault(size = 10, sort = "dataSolicitacao", direction = Sort.Direction.DESC) Pageable pageable) {

        Page<OrdemServicoDTO> pagina = osService.buscarComFiltros(numeroMaquina, prioridade, status, turno, pageable);
        return ResponseEntity.ok(pagina);
    }

    @GetMapping("/{id}")
    public ResponseEntity<OrdemServicoDTO> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(osService.buscarPorId(id));
    }

    @PutMapping("/{id}/ciencia")
    @PreAuthorize("hasRole('LIDER')")
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

    // =========================================================
    //           👇👇 AS CORREÇÕES ESTÃO AQUI 👇👇
    // =========================================================
    @PutMapping("/{id}/status")
    // 1. Adicionado 'LIDER' às permissões
    @PreAuthorize("hasAnyRole('ADMIN', 'MECANICO', 'ANALISTA_CQ', 'LIDER')") 
    // 2. Retorna o DTO completo para manter o frontend sincronizado
    public ResponseEntity<OrdemServicoDTO> atualizarStatus(@PathVariable Long id, @RequestBody StatusUpdateDTO statusUpdate) {
        OrdemServicoDTO osAtualizada = osService.atualizarStatus(id, statusUpdate.getStatus());
        return ResponseEntity.ok(osAtualizada);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'LIDER')")
    public ResponseEntity<Void> deletarOrdemServico(@PathVariable Long id) {
        osService.deletarOrdemServico(id);
        return ResponseEntity.noContent().build();
    }
 
}