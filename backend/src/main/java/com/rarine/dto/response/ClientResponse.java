package com.rarine.dto.response;

import java.time.OffsetDateTime;

import com.rarine.domain.enums.ClientType;

public record ClientResponse(
    Long id,
    ClientType type,
    String name,
    String document,
    String cnpj,
    String razaoSocial,
    String email,
    String phone,
    String city,
    String school,
    String childName,
    String tradeName,
    String stateRegistration,
    String responsibleName,
    String responsiblePhone,
    boolean active,
    OffsetDateTime createdAt,
    OffsetDateTime updatedAt
) {}
