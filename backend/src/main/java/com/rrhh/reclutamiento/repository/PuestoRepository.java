package com.rrhh.reclutamiento.repository;

import com.rrhh.shared.domain.model.Puesto;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PuestoRepository extends JpaRepository<Puesto, Integer> {
    default List<Puesto> findActivosOrdenados() {
        Sort sort = Sort.by("area").ascending().and(Sort.by("nombrePuesto").ascending());
        return findByActivoTrue(sort);
    }

    List<Puesto> findByActivoTrue(Sort sort);
}
