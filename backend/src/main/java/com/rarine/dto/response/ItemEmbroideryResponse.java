package com.rarine.dto.response;

import com.rarine.domain.enums.PrintLocation;

import java.util.Set;

public record ItemEmbroideryResponse(
    Long id,
    PrintLocation location,
    String description,
    Set<EmbroideryColorResponse> colors
) {}
