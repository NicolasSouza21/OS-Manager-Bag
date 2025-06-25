// Local do arquivo: src/main/java/com/bag/osmanager/service/OrdemServicoService.java
package com.bag.osmanager.service;

import com.bag.osmanager.dto.*;
// 🔽 ADICIONE ESTE IMPORT! 🔽
import com.bag.osmanager.exception.ResourceNotFoundException; 
import com.bag.osmanager.model.Funcionario;
import com.bag.osmanager.model.OrdemServico;
import com.bag.osmanager.model.PecaSubstituida;
import com.bag.osmanager.model.enums.StatusVerificacao;
import com.bag.osmanager.repository.FuncionarioRepository;
import com.bag.osmanager.repository.OrdemServicoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrdemServicoService {

    private final OrdemServicoRepository osRepository;
    private final FuncionarioRepository funcionarioRepository;

    // Método para criar uma nova OS (sem alterações aqui)
    @Transactional
    public OrdemServicoDTO criarOS(CriarOrdemServicoDTO dto) {
        OrdemServico os = new OrdemServico();
        BeanUtils.copyProperties(dto, os);
        os.setDataSolicitacao(LocalDateTime.now());
        os.setStatusVerificacao(StatusVerificacao.PENDENTE);

        OrdemServico osSalva = osRepository.save(os);
        return converteParaDTO(osSalva);
    }

    // Método para registrar a ciência do mecânico
    @Transactional
    public OrdemServicoDTO registrarCiencia(Long osId, CienciaDTO dto) {
        // 👇 CORREÇÃO APLICADA 👇
        OrdemServico os = osRepository.findById(osId)
                .orElseThrow(() -> new ResourceNotFoundException("Ordem de Serviço com ID " + osId + " não encontrada!"));
        
        // 👇 CORREÇÃO APLICADA 👇
        Funcionario mecanico = funcionarioRepository.findById(dto.getMecanicoId())
                .orElseThrow(() -> new ResourceNotFoundException("Mecânico com ID " + dto.getMecanicoId() + " não encontrado!"));

        os.setMecanicoCiencia(mecanico);
        os.setDataCiencia(LocalDateTime.now());
        
        OrdemServico osAtualizada = osRepository.save(os);
        return converteParaDTO(osAtualizada);
    }
    
    // Método para registrar a execução da OS
    @Transactional
    public OrdemServicoDTO registrarExecucao(Long osId, ExecucaoDTO dto) {
        // 👇 CORREÇÃO APLICADA 👇
        OrdemServico os = osRepository.findById(osId)
                .orElseThrow(() -> new ResourceNotFoundException("Ordem de Serviço com ID " + osId + " não encontrada!"));
        
        // 👇 CORREÇÃO APLICADA 👇
        Funcionario executante = funcionarioRepository.findById(dto.getMecanicoId())
                .orElseThrow(() -> new ResourceNotFoundException("Mecânico executante com ID " + dto.getMecanicoId() + " não encontrado!"));

        BeanUtils.copyProperties(dto, os, "pecasSubstituidas");
        os.setExecutadoPor(executante);
        os.setDataExecucao(LocalDateTime.now());

        if (Boolean.TRUE.equals(dto.getTrocaPecas()) && dto.getPecasSubstituidas() != null) {
            os.getPecasSubstituidas().clear(); // Limpa a lista antiga para evitar duplicatas
            List<PecaSubstituida> pecas = dto.getPecasSubstituidas().stream().map(pecaDTO -> {
                PecaSubstituida peca = new PecaSubstituida();
                BeanUtils.copyProperties(pecaDTO, peca);
                peca.setOrdemServico(os);
                return peca;
            }).collect(Collectors.toList());
            os.getPecasSubstituidas().addAll(pecas);
        }

        OrdemServico osAtualizada = osRepository.save(os);
        return converteParaDTO(osAtualizada);
    }
    
    // Método para a verificação do Controle de Qualidade (CQ)
    @Transactional
    public OrdemServicoDTO registrarVerificacaoCQ(Long osId, VerificacaoCQDTO dto) {
        // 👇 CORREÇÃO APLICADA 👇
        OrdemServico os = osRepository.findById(osId)
                .orElseThrow(() -> new ResourceNotFoundException("Ordem de Serviço com ID " + osId + " não encontrada!"));
        
        // 👇 CORREÇÃO APLICADA 👇
        Funcionario analista = funcionarioRepository.findById(dto.getAnalistaId())
                 .orElseThrow(() -> new ResourceNotFoundException("Analista de CQ com ID " + dto.getAnalistaId() + " não encontrado!"));
                 
        os.setVerificadoPor(analista);
        os.setStatusVerificacao(dto.getStatusVerificacao());
        
        OrdemServico osAtualizada = osRepository.save(os);
        return converteParaDTO(osAtualizada);
    }
    
    // Método para a aprovação do Líder
    @Transactional
    public OrdemServicoDTO registrarAprovacao(Long osId, AprovacaoDTO dto) {
        // 👇 CORREÇÃO APLICADA 👇
        OrdemServico os = osRepository.findById(osId)
                .orElseThrow(() -> new ResourceNotFoundException("Ordem de Serviço com ID " + osId + " não encontrada!"));
        
        // 👇 CORREÇÃO APLICADA 👇
        Funcionario lider = funcionarioRepository.findById(dto.getLiderId())
                 .orElseThrow(() -> new ResourceNotFoundException("Líder com ID " + dto.getLiderId() + " não encontrado!"));

        os.setAprovadoPor(lider);
        os.setDataAprovacao(LocalDateTime.now());
        
        OrdemServico osAtualizada = osRepository.save(os);
        return converteParaDTO(osAtualizada);
    }
    
    // Método para listar todas as OS
    public List<OrdemServicoDTO> listarTodas() {
        return osRepository.findAll().stream()
                .map(this::converteParaDTO)
                .collect(Collectors.toList());
    }

    // Método para buscar uma OS por ID
    public OrdemServicoDTO buscarPorId(Long id) {
        // 👇 CORREÇÃO APLICADA 👇
        return osRepository.findById(id)
                .map(this::converteParaDTO)
                .orElseThrow(() -> new ResourceNotFoundException("Ordem de Serviço com ID " + id + " não encontrada!"));
    }

    // Método auxiliar para converter Entidade para DTO (sem alterações aqui)
    private OrdemServicoDTO converteParaDTO(OrdemServico os) {
        OrdemServicoDTO dto = new OrdemServicoDTO();
        BeanUtils.copyProperties(os, dto);

        if (os.getMecanicoCiencia() != null) {
            dto.setMecanicoCienciaId(os.getMecanicoCiencia().getId());
        }
        if (os.getExecutadoPor() != null) {
            dto.setExecutadoPorId(os.getExecutadoPor().getId());
        }
        if (os.getVerificadoPor() != null) {
            dto.setVerificadoPorId(os.getVerificadoPor().getId());
        }
        if (os.getAprovadoPor() != null) {
            dto.setAprovadoPorId(os.getAprovadoPor().getId());
        }
        
        if (os.getPecasSubstituidas() != null) {
            dto.setPecasSubstituidas(os.getPecasSubstituidas().stream().map(peca -> {
                PecaSubstituidaDTO pecaDTO = new PecaSubstituidaDTO();
                BeanUtils.copyProperties(peca, pecaDTO);
                return pecaDTO;
            }).collect(Collectors.toList()));
        }

        return dto;
    }
}