package com.bag.osmanager.service;

import com.bag.osmanager.dto.TipoServicoDTO;
// ✨ ALTERAÇÃO AQUI: Import DataIntegrityException removido pois não será mais lançado daqui
// import com.bag.osmanager.exception.DataIntegrityException;
import com.bag.osmanager.exception.ResourceNotFoundException;
import com.bag.osmanager.model.Equipamento;
import com.bag.osmanager.model.TipoServico;
import com.bag.osmanager.repository.EquipamentoRepository;
import com.bag.osmanager.repository.TipoServicoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.hibernate.Hibernate;

import java.util.HashSet;
import java.util.List;
import java.util.Set; // ✨ ALTERAÇÃO AQUI: Import Set adicionado
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TipoServicoService {

    private final TipoServicoRepository tipoServicoRepository;
    private final EquipamentoRepository equipamentoRepository;

    public List<TipoServicoDTO> listarTodos() {
        return tipoServicoRepository.findAll().stream()
                .map(this::converteParaDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public TipoServicoDTO criar(TipoServicoDTO dto) {
        TipoServico tipoServico = new TipoServico();
        BeanUtils.copyProperties(dto, tipoServico, "equipamentoIds");
        // Salva o tipoServico primeiro para ter um ID
        TipoServico salvo = tipoServicoRepository.save(tipoServico);

        if (dto.getEquipamentoIds() != null && !dto.getEquipamentoIds().isEmpty()) {
            // Busca os equipamentos que serão associados
            List<Equipamento> equipamentosParaAssociar = equipamentoRepository.findAllById(dto.getEquipamentoIds());
            for (Equipamento equip : equipamentosParaAssociar) {
                if (equip.getServicosDisponiveis() == null) {
                    equip.setServicosDisponiveis(new HashSet<>());
                }
                // Adiciona o serviço *salvo* (com ID) à coleção do equipamento
                equip.getServicosDisponiveis().add(salvo);
                // Salva o equipamento para persistir a associação na tabela de junção
                equipamentoRepository.save(equip);
            }
            // Atualiza a referência na entidade TipoServico (opcional, dependendo do cascade e fetch)
            // É mais seguro buscar novamente ou atualizar manualmente a coleção aqui se necessário
             salvo.setEquipamentos(new HashSet<>(equipamentosParaAssociar)); // Atualiza a entidade salva
        }

        return converteParaDTO(salvo); // Retorna o DTO com base na entidade final
    }

    @Transactional
    public TipoServicoDTO atualizar(Long id, TipoServicoDTO dto) {
        TipoServico servico = tipoServicoRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Tipo de serviço não encontrado com o ID: " + id));

        BeanUtils.copyProperties(dto, servico, "id", "equipamentoIds");

        // ✨ ALTERAÇÃO AQUI: Lógica para atualizar associações (semelhante ao 'criar')
        // Remove associações antigas não presentes no DTO atualizado (se necessário - depende do requisito)
        // Adiciona novas associações presentes no DTO atualizado (se necessário - depende do requisito)
        // Por simplicidade, este exemplo atualiza apenas nome/descrição.
        // Se precisar atualizar associações, a lógica seria mais complexa aqui.

        TipoServico servicoAtualizado = tipoServicoRepository.save(servico);
        return converteParaDTO(servicoAtualizado);
    }

    // ✨ ALTERAÇÃO AQUI: Método deletar modificado para remover associações
    @Transactional
    public void deletar(Long id) {
        // 1. Busca o serviço ou lança exceção se não encontrado
        TipoServico servico = tipoServicoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tipo de serviço não encontrado com o ID: " + id));

        // 2. ✅ REMOVE ASSOCIAÇÕES: Itera sobre os equipamentos associados e remove o serviço
        Hibernate.initialize(servico.getEquipamentos()); // Garante que a coleção seja carregada
        if (servico.getEquipamentos() != null && !servico.getEquipamentos().isEmpty()) {
            // Cria uma cópia da coleção para evitar ConcurrentModificationException
            Set<Equipamento> equipamentosAssociados = new HashSet<>(servico.getEquipamentos());
            for (Equipamento equip : equipamentosAssociados) {
                // Remove o serviço da coleção do equipamento
                if (equip.getServicosDisponiveis() != null) {
                     equip.getServicosDisponiveis().remove(servico);
                     // Salva o equipamento para atualizar a tabela de junção
                     equipamentoRepository.save(equip);
                }
            }
             // Limpa a coleção na entidade serviço antes de deletar (boa prática)
             servico.getEquipamentos().clear();
             tipoServicoRepository.save(servico); // Salva o serviço com a coleção limpa
        }

        // 3. Agora que as associações foram removidas, exclui o serviço
        tipoServicoRepository.deleteById(id);
    }

    private TipoServicoDTO converteParaDTO(TipoServico tipoServico) {
        TipoServicoDTO dto = new TipoServicoDTO();
        BeanUtils.copyProperties(tipoServico, dto, "equipamentos");

        // Verifica se a coleção foi inicializada antes de acessá-la
        if (Hibernate.isInitialized(tipoServico.getEquipamentos()) && tipoServico.getEquipamentos() != null) {
            dto.setEquipamentoIds(
                tipoServico.getEquipamentos().stream()
                    .map(Equipamento::getId)
                    .collect(Collectors.toSet())
            );
        } else {
            dto.setEquipamentoIds(new HashSet<>());
        }
        return dto;
    }
}