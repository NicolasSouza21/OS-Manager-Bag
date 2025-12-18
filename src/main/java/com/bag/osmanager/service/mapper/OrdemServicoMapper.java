package com.bag.osmanager.service.mapper;

// ✨ ALTERAÇÃO AQUI: Imports adicionados
import com.bag.osmanager.dto.AcompanhamentoOSDTO;
import com.bag.osmanager.dto.FrequenciaDTO;
import com.bag.osmanager.dto.FuncionarioDTO; // ✨ ALTERAÇÃO AQUI: Import necessário
import com.bag.osmanager.dto.OrdemServicoDTO;
import com.bag.osmanager.dto.PecaSubstituidaDTO;
import com.bag.osmanager.dto.TipoServicoDTO;
import com.bag.osmanager.model.AcompanhamentoOS; // ✨ Import da entidade
import com.bag.osmanager.model.Funcionario; // ✨ ALTERAÇÃO AQUI: Import necessário
import com.bag.osmanager.model.OrdemServico;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Component;

// ✨ ALTERAÇÃO AQUI: Imports adicionados
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashSet; // ✨ ALTERAÇÃO AQUI: Import necessário
// ---
import java.util.stream.Collectors;

@Component // Marca esta classe como um bean do Spring para que possamos injetá-la
public class OrdemServicoMapper {

    /**
     * Converte uma entidade OrdemServico para um OrdemServicoDTO.
     * @param os A entidade a ser convertida.
     * @return O DTO correspondente.
     */
    public OrdemServicoDTO converteParaDTO(OrdemServico os) {
        if (os == null) {
            return null;
        }

        OrdemServicoDTO dto = new OrdemServicoDTO();
        // ✨ ALTERAÇÃO AQUI: "acompanhamentos" e "executores" adicionados à lista de exclusão
        BeanUtils.copyProperties(os, dto, "frequencia", "tiposServico", "local", "pecasSubstituidas", "acompanhamentos", "executores");

        dto.setCodigoOs(os.getCodigoOs());

        if (os.getMecanicoCiencia() != null) {
            dto.setLiderCienciaId(os.getMecanicoCiencia().getId());
            dto.setLiderCienciaNome(os.getMecanicoCiencia().getNome());
        }

        // ✨ ALTERAÇÃO AQUI: Lógica de 'executadoPor' removida
        /*
        if (os.getExecutadoPor() != null) {
            dto.setExecutadoPorId(os.getExecutadoPor().getId());
            dto.setExecutadoPorNome(os.getExecutadoPor().getNome());
        }
        */

        if (os.getVerificadoPor() != null) {
            dto.setVerificadoPorId(os.getVerificadoPor().getId());
            dto.setVerificadoPorNome(os.getVerificadoPor().getNome());
        }
        if (os.getAprovadoPor() != null) {
            dto.setAprovadoPorId(os.getAprovadoPor().getId());
            dto.setAprovadoPorNome(os.getAprovadoPor().getNome());
        }
        if (os.getEquipamento() != null) {
            dto.setEquipamentoId(os.getEquipamento().getId());
        }

        if (os.getLocal() != null) {
            dto.setLocalId(os.getLocal().getId());
            dto.setLocalNome(os.getLocal().getNome()); // Adiciona o nome do Local
            if (os.getLocal().getSetor() != null) {
                dto.setSetorNome(os.getLocal().getSetor().getNome()); // Adiciona o nome do Setor
            }
        }
        
        if (os.getPecasSubstituidas() != null) {
            dto.setPecasSubstituidas(os.getPecasSubstituidas().stream().map(peca -> {
                PecaSubstituidaDTO pecaDTO = new PecaSubstituidaDTO();
                BeanUtils.copyProperties(peca, pecaDTO);
                return pecaDTO;
            }).collect(Collectors.toList()));
        }
        
        if (os.getTiposServico() != null) {
            dto.setTiposServico(os.getTiposServico().stream().map(servico -> {
                TipoServicoDTO servicoDto = new TipoServicoDTO();
                BeanUtils.copyProperties(servico, servicoDto);
                return servicoDto;
            }).collect(Collectors.toSet()));
        }
        
        if (os.getFrequencia() != null) {
            FrequenciaDTO freqDTO = new FrequenciaDTO();
            BeanUtils.copyProperties(os.getFrequencia(), freqDTO);
            dto.setFrequencia(freqDTO);
        }

        dto.setInicioDowntime(os.getInicioDowntime());
        dto.setFimDowntime(os.getFimDowntime());

        // ✨ ALTERAÇÃO AQUI: Lógica para converter a lista de acompanhamentos (Mantida do seu código)
        if (os.getAcompanhamentos() != null && !os.getAcompanhamentos().isEmpty()) {
            dto.setAcompanhamentos(
                os.getAcompanhamentos().stream()
                    .map(this::converteAcompanhamentoParaDTO)
                    // Ordena pela data mais recente primeiro
                    .sorted(Comparator.comparing(AcompanhamentoOSDTO::getDataHora).reversed())
                    .collect(Collectors.toList())
            );
        } else {
            dto.setAcompanhamentos(Collections.emptyList()); // Garante que seja uma lista vazia, não nula
        }
        // --- Fim da alteração ---

        // ✨ ALTERAÇÃO AQUI: Nova lógica para converter a lista de executores
        if (os.getExecutores() != null && !os.getExecutores().isEmpty()) {
            dto.setExecutores(
                os.getExecutores().stream()
                    .map(this::converteFuncionarioParaDTO)
                    .collect(Collectors.toSet())
            );
        } else {
            dto.setExecutores(new HashSet<>()); // Garante um Set vazio
        }
        // --- Fim da nova alteração ---

        return dto;
    }

    // ✨ ALTERAÇÃO AQUI: Novo método helper privado para converter o acompanhamento (Mantido do seu código)
    /**
     * Helper para converter a entidade AcompanhamentoOS em AcompanhamentoOSDTO.
     */
    private AcompanhamentoOSDTO converteAcompanhamentoParaDTO(AcompanhamentoOS entidade) {
        if (entidade == null) {
            return null;
        }
        AcompanhamentoOSDTO dto = new AcompanhamentoOSDTO();
        BeanUtils.copyProperties(entidade, dto);
        
        if (entidade.getFuncionario() != null) {
            dto.setFuncionarioId(entidade.getFuncionario().getId());
            dto.setFuncionarioNome(entidade.getFuncionario().getNome());
        }
        if (entidade.getOrdemServico() != null) {
            dto.setOrdemServicoId(entidade.getOrdemServico().getId());
        }
        return dto;
    }

    // ✨ ALTERAÇÃO AQUI: Novo método helper para converter Funcionario -> FuncionarioDTO
    /**
     * Helper para converter a entidade Funcionario em FuncionarioDTO (sem dados sensíveis).
     */
    private FuncionarioDTO converteFuncionarioParaDTO(Funcionario entidade) {
        if (entidade == null) {
            return null;
        }
        FuncionarioDTO dto = new FuncionarioDTO();
        dto.setId(entidade.getId());
        dto.setNome(entidade.getNome());
        dto.setEmail(entidade.getEmail());
        dto.setTipoFuncionario(entidade.getTipoFuncionario());
        // Propositalmente não copiamos a senha
        return dto;
    }
}