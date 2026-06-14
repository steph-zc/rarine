package com.rarine.domain.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

/** Local de aplicação de bordado/estampa de um produto do catálogo (PRODUTO_LOCAL_APLICACAO). */
@Entity
@Table(name = "product_application_locations")
public class ProductApplicationLocation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(name = "location", nullable = false, length = 50)
    private String location;   // frente, costas, manga

    @Column(name = "size", length = 20)
    private String size;       // pequeno, grande (opcional)

    public Long getId() { return id; }
    public Product getProduct() { return product; }
    public void setProduct(Product product) { this.product = product; }
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
    public String getSize() { return size; }
    public void setSize(String size) { this.size = size; }
}
