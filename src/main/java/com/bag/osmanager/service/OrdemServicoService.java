package com.bag.osmanager.service;

import com.bag.osmanager.dto.*;
import com.bag.osmanager.exception.ResourceNotFoundException;
import com.bag.osmanager.model.*;
import com.bag.osmanager.model.enums.*;
import com.bag.osmanager.repository.*;
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
import java.util.ArrayList;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrdemServicoService {

    private final OrdemServicoRepository osRepository;
    private final FuncionarioRepository funcionarioRepository;
    private final EquipamentoRepository equipamentoRepository;
    private final LocalRepository localRepository;

    @Transactional
    public OrdemServicoDTO criarOS(CriarOrdemServicoDTO dto) {
        OrdemServico os = new OrdemServico();
        BeanUtils.copyProperties(dto, os, "equipamentoId", "localId");
        
        LocalDateTime agora = LocalDateTime.now();
        os.setDataSolicitacao(agora);
        os.setStatusVerificacao(StatusVerificacao.PENDENTE);
        os.setStatus(StatusOrdemServico.ABERTA);

        Equipamento equipamento = equipamentoRepository.findById(dto.getEquipamentoId())
                .orElseThrow(() -> new ResourceNotFoundException("Equipamento com ID " + dto.getEquipamentoId() + " não encontrado!"));
        os.setEquipamento(equipamento);

        if (dto.getLocalId() != null) {
            Local local = localRepository.findById(dto.getLocalId())
                    .orElseThrow(() -> new ResourceNotFoundException("Local com ID " + dto.getLocalId() + " não encontrado!"));
            os.setLocal(local);
        }

        // A lógica de data limite só se aplica se não for uma preventiva
        if (dto.getTipoManutencao() != TipoManutencao.PREVENTIVA) {
            switch (dto.getPrioridade()) {
                case ALTA:
                    os.setDataLimite(agora.with(LocalTime.MAX));
                    break;
                case MEDIA:
                    os.setDataLimite(agora.plusDays(4));
                    break;
                case BAIXA:
                    os.setDataLimite(agora.plusDays(7));
                    break;
            }
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
        Funcionario lider = funcionarioRepository.findById(dto.getLiderId())
                .orElseThrow(() -> new ResourceNotFoundException("Líder com ID " + dto.getLiderId() + " não encontrado!"));
        if (lider.getTipoFuncionario() != TipoFuncionario.LIDER) {
            throw new IllegalStateException("Ação não permitida. O funcionário com ID " + dto.getLiderId() + " não é um líder.");
        }
        os.setMecanicoCiencia(lider);
        os.setDataCiencia(LocalDateTime.now());
        os.setStatus(StatusOrdemServico.EM_EXECUCAO);
        
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

        if (dto.getStatusVerificacao() == StatusVerificacao.APROVADO) {
            os.setStatus(StatusOrdemServico.CONCLUIDA);
        } else if (dto.getStatusVerificacao() == StatusVerificacao.REPROVADO) {
            os.setStatus(StatusOrdemServico.CANCELADA);
        }

        OrdemServico osAtualizada = osRepository.save(os);
        return converteParaDTO(osAtualizada);
    }

    @Transactional
    public OrdemServicoDTO registrarExecucao(Long osId, ExecucaoDTO dto) {
        OrdemServico os = osRepository.findById(osId)
                .orElseThrow(() -> new ResourceNotFoundException("Ordem de Serviço com ID " + osId + " não encontrada!"));
        
        Funcionario executante = funcionarioRepository.findById(dto.getMecanicoId())
                .orElseThrow(() -> new ResourceNotFoundException("Mecânico executante com ID " + dto.getMecanicoId() + " não encontrado!"));

        os.setExecutadoPor(executante);
        os.setDataExecucao(LocalDateTime.now());
        os.setAcaoRealizada(dto.getAcaoRealizada());
        os.setTrocaPecas(dto.getTrocaPecas());
        os.setInicio(dto.getInicio());
        os.setTermino(dto.getTermino());
        os.setMaquinaParada(dto.getMaquinaParada());

        if (Boolean.TRUE.equals(dto.getTrocaPecas()) && dto.getPecasSubstituidas() != null) {
            if (os.getPecasSubstituidas() == null) {
                os.setPecasSubstituidas(new ArrayList<>());
            } else {
                os.getPecasSubstituidas().clear();
            }
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

    @Transactional
    public void deletarOrdemServico(Long id) {
        OrdemServico os = osRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ordem de Serviço com ID " + id + " não encontrada!"));
        osRepository.delete(os);
    }
    
    private OrdemServicoDTO converteParaDTO(OrdemServico os) {
        OrdemServicoDTO dto = new OrdemServicoDTO();
        BeanUtils.copyProperties(os, dto); // Copia todos os campos simples e de mesmo nome

        // =========================================================
        //           👇👇 PREENCHIMENTO CORRETO DOS NOMES 👇👇
        // =========================================================

        if (os.getMecanicoCiencia() != null) {
            dto.setLiderCienciaId(os.getMecanicoCiencia().getId());
            dto.setLiderCienciaNome(os.getMecanicoCiencia().getNome());
        }

        if (os.getExecutadoPor() != null) {
            dto.setExecutadoPorId(os.getExecutadoPor().getId());
            dto.setExecutadoPorNome(os.getExecutadoPor().getNome()); // Corrigido
        }

        if (os.getVerificadoPor() != null) {
            dto.setVerificadoPorId(os.getVerificadoPor().getId());
            dto.setVerificadoPorNome(os.getVerificadoPor().getNome()); // Corrigido
        }

        if (os.getAprovadoPor() != null) {
            dto.setAprovadoPorId(os.getAprovadoPor().getId());
            dto.setAprovadoPorNome(os.getAprovadoPor().getNome()); // Corrigido
        }
        
        if (os.getEquipamento() != null) {
            dto.setEquipamentoId(os.getEquipamento().getId());
        }
        if (os.getLocal() != null) {
            dto.setLocalId(os.getLocal().getId());
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