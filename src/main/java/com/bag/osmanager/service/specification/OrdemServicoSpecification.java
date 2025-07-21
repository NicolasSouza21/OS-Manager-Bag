package com.bag.osmanager.service.specification;

import com.bag.osmanager.model.Equipamento;
import com.bag.osmanager.model.Funcionario;
import com.bag.osmanager.model.OrdemServico;
import com.bag.osmanager.model.enums.StatusOrdemServico;
import com.bag.osmanager.model.enums.StatusVerificacao;
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
            Long equipamentoId,
            Long localId,
            Long mecanicoId,
            StatusVerificacao statusVerificacao
    ) {
        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            // ✅ FILTRO POR PALAVRA-CHAVE CORRIGIDO E MELHORADO
            if (StringUtils.hasText(keyword)) {
                // Usamos um LEFT JOIN para buscar no nome do equipamento de forma segura
                Join<OrdemServico, Equipamento> equipamentoJoin = root.join("equipamento", JoinType.LEFT);
                
                Predicate idPredicate = criteriaBuilder.like(root.get("id").as(String.class), "%" + keyword + "%");
                Predicate equipamentoPredicate = criteriaBuilder.like(criteriaBuilder.lower(equipamentoJoin.get("nome")), "%" + keyword.toLowerCase() + "%");
                // Adicionamos a busca na descrição do problema
                Predicate descricaoPredicate = criteriaBuilder.like(criteriaBuilder.lower(root.get("descricaoProblema")), "%" + keyword.toLowerCase() + "%");

                predicates.add(criteriaBuilder.or(idPredicate, equipamentoPredicate, descricaoPredicate));
            }

            // Filtro por Status da OS
            if (status != null) {
                predicates.add(criteriaBuilder.equal(root.get("status"), status));
            }

            // Filtro por Equipamento
            if (equipamentoId != null) {
                predicates.add(criteriaBuilder.equal(root.get("equipamento").get("id"), equipamentoId));
            }

            // Filtro por Local
            if (localId != null) {
                predicates.add(criteriaBuilder.equal(root.get("local").get("id"), localId));
            }

            // Filtro "Minhas Tarefas" (pelo ID do mecânico/líder)
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