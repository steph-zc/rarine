package com.rarine.client.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import com.rarine.client.ClientType;

public record ClientUpdateRequest(
        @NotNull ClientType type,
        @NotBlank @Size(max = 200) String name,
        @NotBlank @Size(max = 30) String document,
        @Email @Size(max = 200) String email,
        @Size(max = 30) String phone
) {}