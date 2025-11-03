package com.bag.osmanager.service.mapper;

import com.bag.osmanager.dto.FrequenciaDTO;
import com.bag.osmanager.dto.OrdemServicoDTO;
import com.bag.osmanager.dto.PecaSubstituidaDTO;
import com.bag.osmanager.dto.TipoServicoDTO;
import com.bag.osmanager.model.OrdemServico;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Component;

import java.util.stream.Collectors;

// ✨ ALTERAÇÃO AQUI: Código completo do novo Mapper
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
        BeanUtils.copyProperties(os, dto, "frequencia", "tiposServico", "local");

        dto.setCodigoOs(os.getCodigoOs());

        if (os.getMecanicoCiencia() != null) {
            dto.setLiderCienciaId(os.getMecanicoCiencia().getId());
            dto.setLiderCienciaNome(os.getMecanicoCiencia().getNome());
        }
        if (os.getExecutadoPor() != null) {
            dto.setExecutadoPorId(os.getExecutadoPor().getId());
            dto.setExecutadoPorNome(os.getExecutadoPor().getNome());
        }
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

        // ✅ CORREÇÃO AQUI: Linhas descomentadas e ajustadas
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

        // ✨ ALTERAÇÃO AQUI: Adiciona a cópia manual dos novos campos de downtime
        // Isso garante que eles sejam enviados ao frontend.
        dto.setInicioDowntime(os.getInicioDowntime());
        dto.setFimDowntime(os.getFimDowntime());

        return dto;
    }
}