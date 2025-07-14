package com.bag.osmanager.controller;

import com.bag.osmanager.dto.*;
import com.bag.osmanager.model.Funcionario;
import com.bag.osmanager.model.enums.Prioridade;
import com.bag.osmanager.model.enums.StatusVerificacao;
import com.bag.osmanager.model.enums.Turno;
import com.bag.osmanager.service.OrdemServicoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ordens-servico")
@RequiredArgsConstructor
public class OrdemServicoController {

    private final OrdemServicoService osService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'LIDER', 'ANALISTA_CQ', 'MECANICO')")
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
    @PreAuthorize("hasAnyRole('LIDER', 'MECANICO')")
    public ResponseEntity<OrdemServicoDTO> registrarCiencia(@PathVariable Long id, Authentication authentication) {
        Funcionario userDetails = (Funcionario) authentication.getPrincipal();
        Long funcionarioId = userDetails.getId();
        return ResponseEntity.ok(osService.registrarCiencia(id, funcionarioId));
    }

    // =========================================================
    //         👇👇 ENDPOINT REINTRODUZIDO AQUI 👇👇
    // =========================================================
    @PutMapping("/{id}/iniciar-execucao")
    @PreAuthorize("hasAnyRole('LIDER', 'MECANICO')")
    public ResponseEntity<OrdemServicoDTO> iniciarExecucao(@PathVariable Long id) {
        return ResponseEntity.ok(osService.iniciarExecucao(id));
    }

    @PutMapping("/{id}/execucao")
    @PreAuthorize("hasAnyRole('LIDER', 'MECANICO')")
    public ResponseEntity<OrdemServicoDTO> registrarExecucao(@PathVariable Long id, @Valid @RequestBody ExecucaoDTO dto, Authentication authentication) {
        Funcionario userDetails = (Funcionario) authentication.getPrincipal();
        Long executanteId = userDetails.getId();
        return ResponseEntity.ok(osService.registrarExecucao(id, executanteId, dto));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'LIDER')")
    public ResponseEntity<Void> deletarOrdemServico(@PathVariable Long id) {
        osService.deletarOrdemServico(id);
        return ResponseEntity.noContent().build();
    }
}