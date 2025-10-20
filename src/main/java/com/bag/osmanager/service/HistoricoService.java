package com.bag.osmanager.service;

import com.bag.osmanager.dto.OrdemServicoDTO;
import com.bag.osmanager.model.OrdemServico;
import com.bag.osmanager.repository.OrdemServicoRepository;
// ✨ ALTERAÇÃO AQUI: Importa o novo Mapper
import com.bag.osmanager.service.mapper.OrdemServicoMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class HistoricoService {

    private final OrdemServicoRepository ordemServicoRepository;
    // ✨ ALTERAÇÃO AQUI: Remove a dependência do OrdemServicoService
    // private final OrdemServicoService ordemServicoService; 
    
    // ✨ ALTERAÇÃO AQUI: Injeta o OrdemServicoMapper
    private final OrdemServicoMapper ordemServicoMapper; 

    /**
     * Busca todas as Ordens de Serviço associadas a um equipamento específico.
     * @param equipamentoId O ID do equipamento.
     * @return Uma lista de Ordens de Serviço (DTOs) ordenada da mais recente para a mais antiga.
     */
    @Transactional(readOnly = true)
    public List<OrdemServicoDTO> getHistoricoPorEquipamento(Long equipamentoId) {
        // Cria um objeto de ordenação para buscar as OS da mais nova para a mais antiga
        Sort sort = Sort.by(Sort.Direction.DESC, "dataSolicitacao");
        
        // Busca todas as OS que correspondem ao ID do equipamento
        List<OrdemServico> historico = ordemServicoRepository.findByEquipamentoId(equipamentoId, sort);

        // Converte a lista de entidades para uma lista de DTOs antes de retornar
        return historico.stream()
                // ✨ ALTERAÇÃO AQUI: Usa o mapper para a conversão
                .map(ordemServicoMapper::converteParaDTO)
                .collect(Collectors.toList());
    }
}