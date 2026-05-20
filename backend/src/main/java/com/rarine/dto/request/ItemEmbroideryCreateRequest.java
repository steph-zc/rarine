package com.rarine.dto.request;

import com.rarine.domain.enums.EmbroideryLocation;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.util.Set;

public record ItemEmbroideryCreateRequest(
    @NotNull EmbroideryLocation location,
    String description,
    @NotEmpty Set<Long> colorIds
) {}
