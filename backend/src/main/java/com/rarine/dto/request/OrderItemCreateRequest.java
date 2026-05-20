package com.rarine.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record OrderItemCreateRequest(
    @NotNull Long productId,
    @Size(max = 100) String color,
    @Size(max = 30)  String size,
    @Size(max = 100) String collar,
    @Size(max = 100) String fabric,
    @NotNull @Min(1) Integer quantity,
    String notes
) {}
