// Crie este arquivo em: src/main/java/com/bag/osmanager/service/specification/OrdemServicoSpecification.java
// (Crie as pastas 'service' e 'specification' se necessário)
package com.bag.osmanager.service.specification;

import com.bag.osmanager.model.OrdemServico;
import com.bag.osmanager.model.enums.Prioridade;
import com.bag.osmanager.model.enums.StatusVerificacao;
import com.bag.osmanager.model.enums.Turno;
import org.springframework.data.jpa.domain.Specification;
import jakarta.persistence.criteria.Predicate;
import java.util.ArrayList;
import java.util.List;

public class OrdemServicoSpecification {

    public static Specification<OrdemServico> comFiltros(
            String numeroMaquina,
            Prioridade prioridade,
            StatusVerificacao status,
            Turno turno) {
        
        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (numeroMaquina != null && !numeroMaquina.isEmpty()) {
                predicates.add(criteriaBuilder.like(root.get("numeroMaquina"), "%" + numeroMaquina + "%"));
            }
            if (prioridade != null) {
                predicates.add(criteriaBuilder.equal(root.get("prioridade"), prioridade));
            }
            if (status != null) {
                predicates.add(criteriaBuilder.equal(root.get("statusVerificacao"), status));
            }
            if (turno != null) {
                predicates.add(criteriaBuilder.equal(root.get("turno"), turno));
            }
            
            // Combina todos os predicados com "AND"
            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }
}