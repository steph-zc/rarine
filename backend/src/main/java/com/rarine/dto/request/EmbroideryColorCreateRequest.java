package com.rarine.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record EmbroideryColorCreateRequest(
    @NotBlank @Size(max = 100) String name,
    @NotBlank @Size(max = 50)  String threadCode,
    @Size(max = 100)           String brand,
    @Size(max = 7)             String hexColor
) {}
