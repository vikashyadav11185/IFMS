package com.nucleusteq.ifms.repository;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import com.nucleusteq.ifms.model.Interviewer;
import com.nucleusteq.ifms.model.Position;

public interface InterviewerRepository extends JpaRepository<Interviewer, Long> {
    Optional<Interviewer> findByEmail(String email);
    List<Interviewer> findByPosition(Position position);
}