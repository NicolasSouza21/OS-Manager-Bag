package com.bag.osmanager.controller;

import com.bag.osmanager.dto.*;
import com.bag.osmanager.model.Funcionario;
import com.bag.osmanager.model.enums.StatusOrdemServico;
import com.bag.osmanager.model.enums.StatusVerificacao;
import com.bag.osmanager.model.enums.TipoManutencao; // ✅ Importe o enum
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
    public ResponseEntity<OrdemServicoDTO> criarOS(@RequestBody @Valid CriarOrdemServicoDTO dto) {
        OrdemServicoDTO osCriada = osService.criarOS(dto);
        return new ResponseEntity<>(osCriada, HttpStatus.CREATED);
    }

    // ✅ MÉTODO ATUALIZADO PARA RECEBER O NOVO FILTRO
    @GetMapping
    public ResponseEntity<Page<OrdemServicoDTO>> buscarComFiltros(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) StatusOrdemServico status,
            @RequestParam(required = false) TipoManutencao tipoManutencao, // <-- Parâmetro adicionado
            @RequestParam(required = false) Long equipamentoId,
            @RequestParam(required = false) Long localId,
            @RequestParam(required = false) Long mecanicoId,
            @RequestParam(required = false) StatusVerificacao statusVerificacao,
            @PageableDefault(size = 10, sort = "dataSolicitacao", direction = Sort.Direction.DESC) Pageable pageable) {

        Page<OrdemServicoDTO> pagina = osService.buscarComFiltros(
            keyword, status, tipoManutencao, equipamentoId, localId, mecanicoId, statusVerificacao, pageable
        );
        return ResponseEntity.ok(pagina);
    }

    @GetMapping("/{id}")
    public ResponseEntity<OrdemServicoDTO> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(osService.buscarPorId(id));
    }

    @PutMapping("/{id}/ciencia")
    public ResponseEntity<OrdemServicoDTO> registrarCiencia(@PathVariable Long id, Authentication authentication) {
        Funcionario userDetails = (Funcionario) authentication.getPrincipal();
        Long funcionarioId = userDetails.getId();
        return ResponseEntity.ok(osService.registrarCiencia(id, funcionarioId));
    }

    @PutMapping("/{id}/iniciar-execucao")
    public ResponseEntity<OrdemServicoDTO> iniciarExecucao(@PathVariable Long id) {
        return ResponseEntity.ok(osService.iniciarExecucao(id));
    }

    @PutMapping("/{id}/execucao")
    public ResponseEntity<OrdemServicoDTO> registrarExecucao(@PathVariable Long id, @Valid @RequestBody ExecucaoDTO dto, Authentication authentication) {
        Funcionario userDetails = (Funcionario) authentication.getPrincipal();
        Long executanteId = userDetails.getId();
        return ResponseEntity.ok(osService.registrarExecucao(id, executanteId, dto));
    }

    @PostMapping("/{id}/verificar")
    public ResponseEntity<OrdemServicoDTO> verificarOS(@PathVariable Long id, @Valid @RequestBody VerificacaoDTO dto, Authentication authentication) {
        Funcionario userDetails = (Funcionario) authentication.getPrincipal();
        Long verificadorId = userDetails.getId();
        OrdemServicoDTO osVerificada = osService.verificarOS(id, verificadorId, dto);
        return ResponseEntity.ok(osVerificada);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Void> deletarOrdemServico(@PathVariable Long id) {
        osService.deletarOrdemServico(id);
        return ResponseEntity.noContent().build();
    }
}