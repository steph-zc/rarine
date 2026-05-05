package com.rarine.product.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record ProductUpdateRequest(
        @NotBlank @Size(max = 200) String name,
        @NotBlank @Size(max = 100) String type,
        @Size(max = 100) String model,
        @Size(max = 100) String collar,
        @Size(max = 100) String fabric,
        @Size(max = 100) String baseColor,
        @NotNull Boolean hasEmbroidery,
        @NotNull Boolean hasPrint
) {}