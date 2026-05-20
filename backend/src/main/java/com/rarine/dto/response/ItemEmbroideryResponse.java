package com.rarine.dto.response;

import com.rarine.domain.enums.EmbroideryLocation;

import java.util.Set;

public record ItemEmbroideryResponse(
    Long id,
    EmbroideryLocation location,
    String description,
    Set<EmbroideryColorResponse> colors
) {}
