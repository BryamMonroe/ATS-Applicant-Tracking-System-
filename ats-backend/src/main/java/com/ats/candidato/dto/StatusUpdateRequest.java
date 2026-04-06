package com.ats.candidato.dto;

import com.ats.candidato.domain.StatusPipeline;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;

@Schema(description = "Payload para mover candidato no pipeline")
public record StatusUpdateRequest(

    @Schema(description = "Novo status do candidato", example = "ENTREVISTA")
    @NotNull(message = "Status é obrigatório")
    StatusPipeline status
) {}
