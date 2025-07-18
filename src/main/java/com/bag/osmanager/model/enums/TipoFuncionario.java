package com.bag.osmanager.model.enums;

public enum TipoFuncionario {
    ADMIN("Administrador"),
    LIDER("Líder"),
    ENCARREGADO("Encarregado"),      // ✅ NOVO CARGO ADICIONADO
    MECANICO("Mecânico"),
    ANALISTA_CQ("Analista de Qualidade"),
    SOLICITANTE("Solicitante");        // ✅ CARGO ESSENCIAL ADICIONADO

    private final String nomeAmigavel;

    TipoFuncionario(String nomeAmigavel) {
        this.nomeAmigavel = nomeAmigavel;
    }

    public String getNomeAmigavel() {
        return nomeAmigavel;
    }
}