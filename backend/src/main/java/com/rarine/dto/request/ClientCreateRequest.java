package com.rarine.dto.request;

import com.rarine.domain.enums.ClientType;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record ClientCreateRequest(
    @NotNull ClientType type,
    @NotBlank @Size(max = 200) String name,
    @NotBlank @Size(max = 30) String document,
    @Email @Size(max = 200) String email,
    @Size(max = 30) String phone,
    @Size(max = 100) String city,
    @Size(max = 200) String school,
    @Size(max = 200) String childName,
    @Size(max = 200) String tradeName,
    @Size(max = 50) String stateRegistration,
    @Size(max = 200) String responsibleName,
    @Size(max = 30) String responsiblePhone
) {}
