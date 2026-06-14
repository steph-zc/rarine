package com.rarine.dto.response;

import java.time.OffsetDateTime;
import java.util.List;

public record ProductResponse(
    Long id,
    String name,
    String type,
    String model,
    String collar,
    String fabric,
    String baseColor,
    boolean hasEmbroidery,
    boolean hasPrint,
    List<ApplicationLocationResponse> applicationLocations,
    OffsetDateTime createdAt,
    OffsetDateTime updatedAt
) {}
