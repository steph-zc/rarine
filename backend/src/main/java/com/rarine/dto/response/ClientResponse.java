package com.rarine.dto.response;

import java.time.OffsetDateTime;

import com.rarine.domain.enums.ClientType;

public record ClientResponse(
    Long id,
    ClientType type,
    String name,
    String document,
    String email,
    String phone,
    boolean active,
    OffsetDateTime createdAt,
    OffsetDateTime updatedAt
) {}

