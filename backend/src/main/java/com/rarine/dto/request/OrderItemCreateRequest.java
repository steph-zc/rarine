package com.rarine.dto.request;

import java.util.List;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record OrderItemCreateRequest(
    @NotNull Long productId,
    @Size(max = 100) String color,
    @Size(max = 100) String collar,
    @Size(max = 50)  String manga,
    @Size(max = 100) String fabric,
    Boolean hasPrint,
    List<EstampaCreateRequest> estampas
) {}
