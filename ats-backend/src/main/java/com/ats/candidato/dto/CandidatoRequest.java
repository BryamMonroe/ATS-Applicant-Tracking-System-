package com.ats.candidato.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.*;
import lombok.Builder;

@Schema(description = "Dados para cadastro ou atualização de candidato")
public record CandidatoRequest(

    @Schema(description = "Nome completo", example = "Ana Paula Silva")
    @NotBlank(message = "Nome é obrigatório")
    @Size(min = 2, max = 150, message = "Nome deve ter entre 2 e 150 caracteres")
    String nome,

    @Schema(description = "E-mail único do candidato", example = "ana@email.com")
    @NotBlank(message = "E-mail é obrigatório")
    @Email(message = "E-mail inválido")
    String email,

    @Schema(description = "Telefone com DDD", example = "(12) 99999-0000")
    @Pattern(regexp = "^[\\d\\s()+-]{8,20}$", message = "Telefone inválido")
    String telefone,

    @Schema(description = "Cargo para o qual está se candidatando", example = "Backend Developer")
    @NotBlank(message = "Cargo desejado é obrigatório")
    @Size(max = 100, message = "Cargo deve ter no máximo 100 caracteres")
    String cargoDesejado,

    @Schema(description = "Observações internas sobre o candidato")
    @Size(max = 2000, message = "Observações devem ter no máximo 2000 caracteres")
    String observacoes
) {}
