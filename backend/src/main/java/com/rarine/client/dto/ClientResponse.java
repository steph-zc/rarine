package com.rarine.client.dto;

import java.time.OffsetDateTime;

import com.rarine.client.ClientType;

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

