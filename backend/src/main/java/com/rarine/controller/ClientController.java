package com.rarine.controller;

import java.net.URI;
import java.util.List;

import com.rarine.domain.entity.Client;
import com.rarine.domain.enums.ClientType;
import com.rarine.dto.request.ClientCreateRequest;
import com.rarine.dto.request.ClientUpdateRequest;
import com.rarine.dto.response.ClientResponse;
import com.rarine.exception.NotFoundException;
import com.rarine.repository.ClientRepository;

import jakarta.validation.Valid;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/clients")
public class ClientController {
  private final ClientRepository repository;

  public ClientController(ClientRepository repository) {
    this.repository = repository;
  }

  @PostMapping
  @ResponseStatus(HttpStatus.CREATED)
  public ClientResponse create(@Valid @RequestBody ClientCreateRequest request) {
    Client c = new Client();
    applyFields(c, request);
    c.setActive(true);
    Client saved = repository.save(c);
    return toResponse(saved);
  }

  @GetMapping
  public List<ClientResponse> list() {
    return repository.findAll().stream().map(this::toResponse).toList();
  }

  @GetMapping("/{id}")
  public ClientResponse get(@PathVariable Long id) {
    return repository.findById(id).map(this::toResponse).orElseThrow(() -> new NotFoundException("Client not found"));
  }

  @PatchMapping("/{id}/inactive")
  public ClientResponse inactivate(@PathVariable Long id) {
    Client c = repository.findById(id).orElseThrow(() -> new NotFoundException("Client not found"));
    c.setActive(false);
    Client saved = repository.save(c);
    return toResponse(saved);
  }

  @PutMapping("/{id}")
  public ClientResponse update(@PathVariable Long id,
                               @Valid @RequestBody ClientUpdateRequest request) {
    Client c = repository.findById(id)
            .orElseThrow(() -> new NotFoundException("Client not found"));
    applyFields(c, request);
    Client saved = repository.save(c);
    return toResponse(saved);
  }

  private void applyFields(Client c, ClientCreateRequest request) {
    c.setType(request.type());
    c.setName(request.name());
    c.setDocument(request.document());
    c.setEmail(request.email());
    c.setPhone(request.phone());
    c.setCity(request.city());
    c.setSchool(request.school());
    c.setChildName(request.childName());
    c.setTradeName(request.tradeName());
    c.setStateRegistration(request.stateRegistration());
    c.setResponsibleName(request.responsibleName());
    c.setResponsiblePhone(request.responsiblePhone());
  }

  private void applyFields(Client c, ClientUpdateRequest request) {
    c.setType(request.type());
    c.setName(request.name());
    c.setDocument(request.document());
    c.setEmail(request.email());
    c.setPhone(request.phone());
    c.setCity(request.city());
    c.setSchool(request.school());
    c.setChildName(request.childName());
    c.setTradeName(request.tradeName());
    c.setStateRegistration(request.stateRegistration());
    c.setResponsibleName(request.responsibleName());
    c.setResponsiblePhone(request.responsiblePhone());
  }

  private ClientResponse toResponse(Client c) {
    return new ClientResponse(
        c.getId(),
        c.getType(),
        c.getName(),
        c.getDocument(),
        c.getEmail(),
        c.getPhone(),
        c.getCity(),
        c.getSchool(),
        c.getChildName(),
        c.getTradeName(),
        c.getStateRegistration(),
        c.getResponsibleName(),
        c.getResponsiblePhone(),
        c.isActive(),
        c.getCreatedAt(),
        c.getUpdatedAt()
    );
  }

  @ExceptionHandler(DataIntegrityViolationException.class)
  @ResponseStatus(HttpStatus.CONFLICT)
  ProblemDetail handleConstraint(DataIntegrityViolationException ex) {
    ProblemDetail pd = ProblemDetail.forStatus(HttpStatus.CONFLICT);
    pd.setTitle("Constraint violation");
    pd.setDetail("Possible duplicate document or invalid data.");
    pd.setType(URI.create("urn:rarine:conflict"));
    return pd;
  }
}
