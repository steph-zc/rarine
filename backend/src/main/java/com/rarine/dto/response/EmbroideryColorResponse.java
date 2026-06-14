package com.rarine.dto.response;

import java.time.OffsetDateTime;

public record EmbroideryColorResponse(
    Long id,
    String name,
    String threadCode,
    String brand,
    String hexColor,
    OffsetDateTime createdAt,
    OffsetDateTime updatedAt
) {}
