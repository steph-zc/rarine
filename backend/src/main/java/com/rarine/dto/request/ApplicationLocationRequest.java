package com.rarine.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/** Local de aplicação de bordado/estampa de um produto (frente/costas/manga + tamanho opcional). */
public record ApplicationLocationRequest(
    @NotBlank @Size(max = 50) String location,
    @Size(max = 20) String size
) {}
