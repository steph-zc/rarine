package com.rarine.domain.entity;

import java.time.OffsetDateTime;
import java.util.HashSet;
import java.util.Set;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;

@Entity
@Table(name = "order_items")
public class OrderItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    @ManyToOne(fetch = FetchType.LAZY, optional = true)
    @JoinColumn(name = "product_id", nullable = true)
    private Product product;

    // Snapshot do nome do produto no momento do pedido (RN02.01)
    @Column(name = "product_name", length = 200)
    private String productName;

    @Column(name = "color", length = 100)
    private String color;

    @Column(name = "size", length = 30)
    private String size;

    @Column(name = "collar", length = 100)
    private String collar;

    @Column(name = "manga", length = 50)
    private String manga;

    @Column(name = "fabric", length = 100)
    private String fabric;

    @Column(name = "quantity", nullable = false)
    private int quantity = 1;

    @Column(name = "has_print", nullable = false)
    private boolean hasPrint = false;

    @Column(name = "notes")
    private String notes;

    @Column(name = "price", length = 100)
    private String price;

    // Set em vez de List — evita MultipleBagFetchException
    @OneToMany(mappedBy = "orderItem", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<ItemEmbroidery> embroideries = new HashSet<>();

    @Column(name = "created_at", nullable = false, insertable = false, updatable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at", nullable = false, insertable = false, updatable = false)
    private OffsetDateTime updatedAt;

    public Long getId() { return id; }
    public Order getOrder() { return order; }
    public void setOrder(Order order) { this.order = order; }
    public Product getProduct() { return product; }
    public void setProduct(Product product) { this.product = product; }
    public String getProductName() { return productName; }
    public void setProductName(String productName) { this.productName = productName; }
    public String getColor() { return color; }
    public void setColor(String color) { this.color = color; }
    public String getSize() { return size; }
    public void setSize(String size) { this.size = size; }
    public String getCollar() { return collar; }
    public void setCollar(String collar) { this.collar = collar; }
    public String getManga() { return manga; }
    public void setManga(String manga) { this.manga = manga; }
    public String getFabric() { return fabric; }
    public void setFabric(String fabric) { this.fabric = fabric; }
    public int getQuantity() { return quantity; }
    public void setQuantity(int quantity) { this.quantity = quantity; }
    public boolean isHasPrint() { return hasPrint; }
    public void setHasPrint(boolean hasPrint) { this.hasPrint = hasPrint; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    public String getPrice() { return price; }
    public void setPrice(String price) { this.price = price; }
    public Set<ItemEmbroidery> getEmbroideries() { return embroideries; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
    public OffsetDateTime getUpdatedAt() { return updatedAt; }
}
