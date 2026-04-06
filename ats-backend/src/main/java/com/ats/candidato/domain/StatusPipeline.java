package com.ats.candidato.domain;

/**
 * Representa as etapas do pipeline de recrutamento.
 *
 * A ordem dos valores aqui reflete a progressão natural do processo:
 * APLICADO → TRIAGEM → ENTREVISTA → OFERTA → APROVADO
 *                                           → REPROVADO (saída em qualquer etapa)
 *
 * Usamos String no banco (@Enumerated(STRING)) para que a coluna
 * armazene "APLICADO" e não "0" — isso torna o banco legível
 * e evita bugs se a ordem do enum mudar no futuro.
 */
public enum StatusPipeline {
    APLICADO,
    TRIAGEM,
    ENTREVISTA,
    OFERTA,
    APROVADO,
    REPROVADO
}
