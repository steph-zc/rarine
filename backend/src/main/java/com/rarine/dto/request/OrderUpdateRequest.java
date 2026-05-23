package com.rarine.dto.request;

import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public record OrderUpdateRequest(
    @NotNull Long clientId,
    LocalDate deadline,
    String notes
) {}
