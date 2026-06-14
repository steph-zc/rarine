package com.rarine.controller;

import java.util.List;

import com.rarine.domain.entity.Product;
import com.rarine.domain.entity.ProductApplicationLocation;
import com.rarine.dto.request.ApplicationLocationRequest;
import com.rarine.dto.request.ProductCreateRequest;
import com.rarine.dto.response.ApplicationLocationResponse;
import com.rarine.dto.response.ProductResponse;
import com.rarine.repository.ProductRepository;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.rarine.dto.request.ProductUpdateRequest;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.http.ProblemDetail;
import org.springframework.web.bind.annotation.ExceptionHandler;
import java.net.URI;

@RestController
@RequestMapping("/api/products")
public class ProductController {
  private final ProductRepository repository;

  public ProductController(ProductRepository repository) {
    this.repository = repository;
  }

  @PostMapping
  @ResponseStatus(HttpStatus.CREATED)
  public ProductResponse create(@Valid @RequestBody ProductCreateRequest request) {
    Product p = new Product();
    p.setName(request.name());
    p.setType(request.type());
    p.setModel(request.model());
    p.setCollar(request.collar());
    p.setFabric(request.fabric());
    p.setBaseColor(request.baseColor());
    p.setHasEmbroidery(request.hasEmbroidery());
    p.setHasPrint(request.hasPrint());
    applyLocations(p, request.applicationLocations());
    Product saved = repository.save(p);
    return toResponse(saved);
  }

  @GetMapping
  public List<ProductResponse> list() {
    return repository.findAll().stream().map(this::toResponse).toList();
  }

  @GetMapping("/{id}")
  public ProductResponse get(@PathVariable Long id) {
    return repository.findById(id)
            .map(this::toResponse)
            .orElseThrow(() -> new NotFoundException("Product not found"));
  }

  @PutMapping("/{id}")
  public ProductResponse update(@PathVariable Long id,
                                @Valid @RequestBody ProductUpdateRequest request) {
    Product p = repository.findById(id)
            .orElseThrow(() -> new NotFoundException("Product not found"));
    p.setName(request.name());
    p.setType(request.type());
    p.setModel(request.model());
    p.setCollar(request.collar());
    p.setFabric(request.fabric());
    p.setBaseColor(request.baseColor());
    p.setHasEmbroidery(request.hasEmbroidery());
    p.setHasPrint(request.hasPrint());
    applyLocations(p, request.applicationLocations());
    Product saved = repository.save(p);
    return toResponse(saved);
  }

  /** Substitui os locais de aplicação do produto pelos informados na requisição. */
  private void applyLocations(Product p, List<ApplicationLocationRequest> locations) {
    p.getApplicationLocations().clear();
    if (locations == null) return;
    for (ApplicationLocationRequest loc : locations) {
      if (loc == null || loc.location() == null || loc.location().isBlank()) continue;
      ProductApplicationLocation pal = new ProductApplicationLocation();
      pal.setProduct(p);
      pal.setLocation(loc.location());
      pal.setSize(loc.size());
      p.getApplicationLocations().add(pal);
    }
  }

  @ResponseStatus(HttpStatus.NOT_FOUND)
  private static class NotFoundException extends RuntimeException {
    NotFoundException(String message) {
      super(message);
    }
  }

  @ExceptionHandler(NotFoundException.class)
  @ResponseStatus(HttpStatus.NOT_FOUND)
  ProblemDetail handleNotFound(NotFoundException ex) {
    ProblemDetail pd = ProblemDetail.forStatus(HttpStatus.NOT_FOUND);
    pd.setTitle("Not found");
    pd.setDetail(ex.getMessage());
    pd.setType(URI.create("urn:rarine:not-found"));
    return pd;
  }

  private ProductResponse toResponse(Product p) {
    List<ApplicationLocationResponse> locations = p.getApplicationLocations().stream()
        .map(l -> new ApplicationLocationResponse(l.getId(), l.getLocation(), l.getSize()))
        .toList();
    return new ProductResponse(
        p.getId(),
        p.getName(),
        p.getType(),
        p.getModel(),
        p.getCollar(),
        p.getFabric(),
        p.getBaseColor(),
        p.isHasEmbroidery(),
        p.isHasPrint(),
        locations,
        p.getCreatedAt(),
        p.getUpdatedAt()
    );
  }
}

