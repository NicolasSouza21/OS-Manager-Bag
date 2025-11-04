package com.bag.osmanager.controller;

import com.bag.osmanager.dto.AcompanhamentoOSDTO;
import com.bag.osmanager.model.Funcionario;
import com.bag.osmanager.service.AcompanhamentoOSService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
// ✨ ALTERAÇÃO AQUI: Imports adicionados
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
// ---
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List; // ✨ ALTERAÇÃO AQUI: Import adicionado

@RestController
@RequestMapping("/api/acompanhamentos")
@RequiredArgsConstructor
public class AcompanhamentoOSController {

    private final AcompanhamentoOSService acompanhamentoService;

    /**
     * Endpoint para um mecânico criar um novo relatório parcial (acompanhamento)
     * para uma Ordem de Serviço.
     */
    @PostMapping
    public ResponseEntity<AcompanhamentoOSDTO> criarAcompanhamento(
            @Valid @RequestBody AcompanhamentoOSDTO dto,
            Authentication authentication) {
        
        // Pega o ID do funcionário logado (o mecânico)
        Funcionario userDetails = (Funcionario) authentication.getPrincipal();
        Long funcionarioId = userDetails.getId();

        AcompanhamentoOSDTO salvo = acompanhamentoService.criarAcompanhamento(dto, funcionarioId);
        return new ResponseEntity<>(salvo, HttpStatus.CREATED);
    }

    // ✨ ALTERAÇÃO AQUI: Novo endpoint para buscar os relatórios de uma OS
    /**
     * Endpoint para buscar todo o histórico de acompanhamentos (relatórios parciais)
     * de uma Ordem de Serviço específica.
     *
     * @param osId O ID da Ordem de Serviço.
     * @return Uma lista de DTOs de acompanhamento.
     */
    @GetMapping("/os/{osId}")
    public ResponseEntity<List<AcompanhamentoOSDTO>> getAcompanhamentosPorOS(@PathVariable Long osId) {
        List<AcompanhamentoOSDTO> historico = acompanhamentoService.getAcompanhamentosPorOS(osId);
        return ResponseEntity.ok(historico);
    }
}