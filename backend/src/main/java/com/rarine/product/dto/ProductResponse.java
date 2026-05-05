package com.rarine.product.dto;

import java.time.OffsetDateTime;

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
    OffsetDateTime createdAt,
    OffsetDateTime updatedAt
) {}

