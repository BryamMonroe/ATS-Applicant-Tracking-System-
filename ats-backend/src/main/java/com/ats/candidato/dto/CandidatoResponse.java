package com.ats.candidato.dto;

import com.ats.candidato.domain.Candidato;
import com.ats.candidato.domain.StatusPipeline;
import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDateTime;

@Schema(description = "Dados de retorno de um candidato")
public record CandidatoResponse(
    Long id,
    String nome,
    String email,
    String telefone,
    String cargoDesejado,
    StatusPipeline status,
    boolean temCurriculo,
    String observacoes,
    LocalDateTime dataCadastro,
    LocalDateTime dataAtualizacao
) {
    public static CandidatoResponse from(Candidato c) {
        return new CandidatoResponse(
            c.getId(),
            c.getNome(),
            c.getEmail(),
            c.getTelefone(),
            c.getCargoDesejado(),
            c.getStatus(),
            c.getCurriculoPath() != null,  // true se tem currículo, false se não tem
            c.getObservacoes(),
            c.getDataCadastro(),
            c.getDataAtualizacao()
        );
    }
}
