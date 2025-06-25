// Local do arquivo: src/main/java/com/bag/osmanager/service/OrdemServicoService.java
package com.bag.osmanager.service;

import com.bag.osmanager.dto.*;
import com.bag.osmanager.exception.ResourceNotFoundException;
import com.bag.osmanager.model.Funcionario;
import com.bag.osmanager.model.OrdemServico;
import com.bag.osmanager.model.PecaSubstituida;
import com.bag.osmanager.model.enums.Prioridade;
import com.bag.osmanager.model.enums.StatusVerificacao;
import com.bag.osmanager.model.enums.Turno;
import com.bag.osmanager.repository.FuncionarioRepository;
import com.bag.osmanager.repository.OrdemServicoRepository;
import com.bag.osmanager.service.specification.OrdemServicoSpecification;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.BeanUtils;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrdemServicoService {

    private final OrdemServicoRepository osRepository;
    private final FuncionarioRepository funcionarioRepository;

    @Transactional
    public OrdemServicoDTO criarOS(CriarOrdemServicoDTO dto) {
        OrdemServico os = new OrdemServico();
        BeanUtils.copyProperties(dto, os);

        LocalDateTime agora = LocalDateTime.now();
        os.setDataSolicitacao(agora);
        os.setStatusVerificacao(StatusVerificacao.PENDENTE);

        // 👇 LÓGICA DE TOLERÂNCIA APLICADA AQUI 👇
        switch (dto.getPrioridade()) {
            case ALTA:
                // Se for ALTA, o prazo é até o final do dia da solicitação.
                os.setDataLimite(agora.with(LocalTime.MAX)); 
                break;
            case MEDIA:
                // Se for MEDIA, o prazo é de 4 dias.
                os.setDataLimite(agora.plusDays(4));
                break;
            case BAIXA:
                // Se for BAIXA, o prazo é de 7 dias.
                os.setDataLimite(agora.plusDays(7));
                break;
        }

        OrdemServico osSalva = osRepository.save(os);
        return converteParaDTO(osSalva);
    }

    public Page<OrdemServicoDTO> buscarComFiltros(
            String numeroMaquina,
            Prioridade prioridade,
            StatusVerificacao status,
            Turno turno,
            Pageable pageable) {

        Specification<OrdemServico> spec = OrdemServicoSpecification.comFiltros(
            numeroMaquina, prioridade, status, turno
        );

        Page<OrdemServico> paginaDeOS = osRepository.findAll(spec, pageable);
        return paginaDeOS.map(this::converteParaDTO);
    }

    public OrdemServicoDTO buscarPorId(Long id) {
        return osRepository.findById(id)
                .map(this::converteParaDTO)
                .orElseThrow(() -> new ResourceNotFoundException("Ordem de Serviço com ID " + id + " não encontrada!"));
    }

    @Transactional
    public OrdemServicoDTO registrarCiencia(Long osId, CienciaDTO dto) {
        OrdemServico os = osRepository.findById(osId)
                .orElseThrow(() -> new ResourceNotFoundException("Ordem de Serviço com ID " + osId + " não encontrada!"));
        Funcionario mecanico = funcionarioRepository.findById(dto.getMecanicoId())
                .orElseThrow(() -> new ResourceNotFoundException("Mecânico com ID " + dto.getMecanicoId() + " não encontrado!"));
        os.setMecanicoCiencia(mecanico);
        os.setDataCiencia(LocalDateTime.now());
        OrdemServico osAtualizada = osRepository.save(os);
        return converteParaDTO(osAtualizada);
    }

    @Transactional
    public OrdemServicoDTO registrarExecucao(Long osId, ExecucaoDTO dto) {
        OrdemServico os = osRepository.findById(osId)
                .orElseThrow(() -> new ResourceNotFoundException("Ordem de Serviço com ID " + osId + " não encontrada!"));
        Funcionario executante = funcionarioRepository.findById(dto.getMecanicoId())
                .orElseThrow(() -> new ResourceNotFoundException("Mecânico executante com ID " + dto.getMecanicoId() + " não encontrado!"));
        BeanUtils.copyProperties(dto, os, "pecasSubstituidas");
        os.setExecutadoPor(executante);
        os.setDataExecucao(LocalDateTime.now());
        if (Boolean.TRUE.equals(dto.getTrocaPecas()) && dto.getPecasSubstituidas() != null) {
            os.getPecasSubstituidas().clear();
            dto.getPecasSubstituidas().forEach(pecaDTO -> {
                PecaSubstituida peca = new PecaSubstituida();
                BeanUtils.copyProperties(pecaDTO, peca);
                peca.setOrdemServico(os);
                os.getPecasSubstituidas().add(peca);
            });
        }
        OrdemServico osAtualizada = osRepository.save(os);
        return converteParaDTO(osAtualizada);
    }

    @Transactional
    public OrdemServicoDTO registrarVerificacaoCQ(Long osId, VerificacaoCQDTO dto) {
        OrdemServico os = osRepository.findById(osId)
                .orElseThrow(() -> new ResourceNotFoundException("Ordem de Serviço com ID " + osId + " não encontrada!"));
        Funcionario analista = funcionarioRepository.findById(dto.getAnalistaId())
                 .orElseThrow(() -> new ResourceNotFoundException("Analista de CQ com ID " + dto.getAnalistaId() + " não encontrado!"));
        os.setVerificadoPor(analista);
        os.setStatusVerificacao(dto.getStatusVerificacao());
        OrdemServico osAtualizada = osRepository.save(os);
        return converteParaDTO(osAtualizada);
    }

    @Transactional
    public OrdemServicoDTO registrarAprovacao(Long osId, AprovacaoDTO dto) {
        OrdemServico os = osRepository.findById(osId)
                .orElseThrow(() -> new ResourceNotFoundException("Ordem de Serviço com ID " + osId + " não encontrada!"));
        Funcionario lider = funcionarioRepository.findById(dto.getLiderId())
                 .orElseThrow(() -> new ResourceNotFoundException("Líder com ID " + dto.getLiderId() + " não encontrado!"));
        os.setAprovadoPor(lider);
        os.setDataAprovacao(LocalDateTime.now());
        OrdemServico osAtualizada = osRepository.save(os);
        return converteParaDTO(osAtualizada);
    }

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