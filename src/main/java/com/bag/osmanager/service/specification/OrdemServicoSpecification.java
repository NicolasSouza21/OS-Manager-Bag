// Local do arquivo: src/main/java/com/bag/osmanager/service/specification/OrdemServicoSpecification.java

package com.bag.osmanager.service.specification;

import com.bag.osmanager.model.Equipamento;
import com.bag.osmanager.model.Funcionario;
import com.bag.osmanager.model.OrdemServico;
import com.bag.osmanager.model.enums.StatusOrdemServico;
import com.bag.osmanager.model.enums.StatusVerificacao;
import com.bag.osmanager.model.enums.TipoManutencao;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.util.StringUtils;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

public class OrdemServicoSpecification {

    public static Specification<OrdemServico> comFiltros(
            String keyword,
            StatusOrdemServico status,
            TipoManutencao tipoManutencao,
            Long equipamentoId,
            Long localId,
            Long mecanicoId,
            StatusVerificacao statusVerificacao,
            LocalDate dataInicio,
            LocalDate dataFim
    ) {
        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (StringUtils.hasText(keyword)) {
                Join<OrdemServico, Equipamento> equipamentoJoin = root.join("equipamento", JoinType.LEFT);
                Predicate codigoOsPredicate = criteriaBuilder.like(criteriaBuilder.lower(root.get("codigoOs")), "%" + keyword.toLowerCase() + "%");
                Predicate equipamentoPredicate = criteriaBuilder.like(criteriaBuilder.lower(equipamentoJoin.get("nome")), "%" + keyword.toLowerCase() + "%");
                Predicate descricaoPredicate = criteriaBuilder.like(criteriaBuilder.lower(root.get("descricaoProblema")), "%" + keyword.toLowerCase() + "%");
                predicates.add(criteriaBuilder.or(codigoOsPredicate, equipamentoPredicate, descricaoPredicate));
            }
            if (status != null) {
                predicates.add(criteriaBuilder.equal(root.get("status"), status));
            }
            if (tipoManutencao != null) {
                predicates.add(criteriaBuilder.equal(root.get("tipoManutencao"), tipoManutencao));
            }
            if (equipamentoId != null) {
                predicates.add(criteriaBuilder.equal(root.get("equipamento").get("id"), equipamentoId));
            }
            if (localId != null) {
                predicates.add(criteriaBuilder.equal(root.get("local").get("id"), localId));
            }
            if (mecanicoId != null) {
                Join<OrdemServico, Funcionario> cienciaJoin = root.join("mecanicoCiencia", JoinType.LEFT);
                Join<OrdemServico, Funcionario> execucaoJoin = root.join("executadoPor", JoinType.LEFT);
                Predicate cienciaPredicate = criteriaBuilder.equal(cienciaJoin.get("id"), mecanicoId);
                Predicate execucaoPredicate = criteriaBuilder.equal(execucaoJoin.get("id"), mecanicoId);
                predicates.add(criteriaBuilder.or(cienciaPredicate, execucaoPredicate));
            }
            if (statusVerificacao != null) {
                predicates.add(criteriaBuilder.equal(root.get("statusVerificacao"), statusVerificacao));
            }

            // ✨ ALTERAÇÃO AQUI: Lógica de filtro de data aprimorada
            // Esta nova lógica verifica se a 'data de solicitação' (para corretivas) OU a 'data de início da preventiva'
            // está dentro do intervalo de datas fornecido.
            if (dataInicio != null && dataFim != null) {
                // Se ambas as datas (início e fim) são fornecidas, criamos um predicado 'OU' para os dois campos.
                Predicate rangeCorretiva = criteriaBuilder.between(root.get("dataSolicitacao"), dataInicio.atStartOfDay(), dataFim.atTime(23, 59, 59));
                Predicate rangePreventiva = criteriaBuilder.between(root.get("dataInicioPreventiva"), dataInicio.atStartOfDay(), dataFim.atTime(23, 59, 59));
                predicates.add(criteriaBuilder.or(rangeCorretiva, rangePreventiva));
            } else if (dataInicio != null) {
                // Se apenas a data de início é fornecida
                Predicate fromCorretiva = criteriaBuilder.greaterThanOrEqualTo(root.get("dataSolicitacao"), dataInicio.atStartOfDay());
                Predicate fromPreventiva = criteriaBuilder.greaterThanOrEqualTo(root.get("dataInicioPreventiva"), dataInicio.atStartOfDay());
                predicates.add(criteriaBuilder.or(fromCorretiva, fromPreventiva));
            } else if (dataFim != null) {
                // Se apenas a data de fim é fornecida
                Predicate toCorretiva = criteriaBuilder.lessThanOrEqualTo(root.get("dataSolicitacao"), dataFim.atTime(23, 59, 59));
                Predicate toPreventiva = criteriaBuilder.lessThanOrEqualTo(root.get("dataInicioPreventiva"), dataFim.atTime(23, 59, 59));
                predicates.add(criteriaBuilder.or(toCorretiva, toPreventiva));
            }

            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }
}