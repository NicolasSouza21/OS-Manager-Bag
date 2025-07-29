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

import java.time.LocalDate; // ✨ IMPORT ADICIONADO
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
            // ✨ ALTERAÇÃO: Adicionados os parâmetros de data.
            LocalDate dataInicio,
            LocalDate dataFim
    ) {
        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            // --- Seus filtros existentes permanecem inalterados ---
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

            // ✨ ALTERAÇÃO: Lógica do filtro de data adicionada aqui.
            if (dataInicio != null) {
                // Filtra pela data de solicitação a partir do início do dia da data de início.
                predicates.add(criteriaBuilder.greaterThanOrEqualTo(root.get("dataSolicitacao"), dataInicio.atStartOfDay()));
            }
            if (dataFim != null) {
                // Filtra pela data de solicitação até o final do dia da data de fim.
                predicates.add(criteriaBuilder.lessThanOrEqualTo(root.get("dataSolicitacao"), dataFim.atTime(23, 59, 59)));
            }

            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }
}