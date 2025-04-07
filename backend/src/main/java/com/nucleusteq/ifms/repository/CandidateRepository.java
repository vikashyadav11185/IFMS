package com.nucleusteq.ifms.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import com.nucleusteq.ifms.model.Candidate;

public interface CandidateRepository extends JpaRepository<Candidate, Long> {
	boolean existsByEmail(String email);
	List<Candidate> findByEmail(String email);
    List<Candidate> findByStatus(String status);
}