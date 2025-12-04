package com.rrhh.auth.repository;

import com.rrhh.shared.domain.model.Reclutador;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ReclutadorRepository extends JpaRepository<Reclutador, Integer> {
    Optional<Reclutador> findByIdUsuario(Integer idUsuario);
    Optional<Reclutador> findByEmail(String email);
}

