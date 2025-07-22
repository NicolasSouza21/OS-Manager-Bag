package com.bag.osmanager.service.specification;

import com.bag.osmanager.model.Equipamento;
import com.bag.osmanager.model.Funcionario;
import com.bag.osmanager.model.OrdemServico;
import com.bag.osmanager.model.enums.StatusOrdemServico;
import com.bag.osmanager.model.enums.StatusVerificacao;
import com.bag.osmanager.model.enums.TipoManutencao; // ✅ Importe o enum TipoManutencao
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.List;

public class OrdemServicoSpecification {

    public static Specification<OrdemServico> comFiltros(
            String keyword,
            StatusOrdemServico status,
            TipoManutencao tipoManutencao, // ✅ Novo parâmetro adicionado
            Long equipamentoId,
            Long localId,
            Long mecanicoId,
            StatusVerificacao statusVerificacao
    ) {
        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            // Filtro por palavra-chave (keyword)
            if (StringUtils.hasText(keyword)) {
                Join<OrdemServico, Equipamento> equipamentoJoin = root.join("equipamento", JoinType.LEFT);
                Predicate idPredicate = criteriaBuilder.like(root.get("id").as(String.class), "%" + keyword + "%");
                Predicate equipamentoPredicate = criteriaBuilder.like(criteriaBuilder.lower(equipamentoJoin.get("nome")), "%" + keyword.toLowerCase() + "%");
                Predicate descricaoPredicate = criteriaBuilder.like(criteriaBuilder.lower(root.get("descricaoProblema")), "%" + keyword.toLowerCase() + "%");
                predicates.add(criteriaBuilder.or(idPredicate, equipamentoPredicate, descricaoPredicate));
            }

            // Filtro por Status da OS
            if (status != null) {
                predicates.add(criteriaBuilder.equal(root.get("status"), status));
            }

            // ✅ NOVO FILTRO POR TIPO DE MANUTENÇÃO
            if (tipoManutencao != null) {
                predicates.add(criteriaBuilder.equal(root.get("tipoManutencao"), tipoManutencao));
            }

            // Filtro por Equipamento
            if (equipamentoId != null) {
                predicates.add(criteriaBuilder.equal(root.get("equipamento").get("id"), equipamentoId));
            }

            // Filtro por Local
            if (localId != null) {
                predicates.add(criteriaBuilder.equal(root.get("local").get("id"), localId));
            }

            // Filtro "Minhas Tarefas"
            if (mecanicoId != null) {
                Join<OrdemServico, Funcionario> cienciaJoin = root.join("mecanicoCiencia", JoinType.LEFT);
                Join<OrdemServico, Funcionario> execucaoJoin = root.join("executadoPor", JoinType.LEFT);
                Predicate cienciaPredicate = criteriaBuilder.equal(cienciaJoin.get("id"), mecanicoId);
                Predicate execucaoPredicate = criteriaBuilder.equal(execucaoJoin.get("id"), mecanicoId);
                predicates.add(criteriaBuilder.or(cienciaPredicate, execucaoPredicate));
            }
            
            // Filtro "Aguardando Minha Verificação"
            if (statusVerificacao != null) {
                predicates.add(criteriaBuilder.equal(root.get("statusVerificacao"), statusVerificacao));
            }

            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }
}