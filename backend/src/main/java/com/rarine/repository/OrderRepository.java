package com.rarine.repository;

import com.rarine.domain.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface OrderRepository extends JpaRepository<Order, Long> {

    // Query 1: carrega items + product + bordados + cores
    @Query("""
        select distinct o from Order o
        left join fetch o.client
        left join fetch o.items i
        left join fetch i.product
        left join fetch i.embroideries e
        left join fetch e.colors
        where o.id = :id
    """)
    Optional<Order> findByIdWithItemsAndEmbroideries(@Param("id") Long id);

    // Query 2: carrega apenas attachments (bag separado)
    @Query("""
        select distinct o from Order o
        left join fetch o.attachments
        where o.id = :id
    """)
    Optional<Order> findByIdWithAttachments(@Param("id") Long id);
}
