package com.rarine.dto.request;

import java.util.Set;

import com.rarine.domain.enums.PrintLocation;

import jakarta.validation.constraints.NotNull;

/** Uma aplicação de estampa/bordado num local do item, com as cores e descrição. */
public record EstampaCreateRequest(
    @NotNull PrintLocation location,
    String description,
    Set<Long> colorIds
) {}
