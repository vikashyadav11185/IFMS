package com.nucleusteq.ifms.repository;

import java.time.LocalDate;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import com.nucleusteq.ifms.model.Interview;
import com.nucleusteq.ifms.model.InterviewRound;
import com.nucleusteq.ifms.model.User;

public interface InterviewRepository extends JpaRepository<Interview, Long> {
    
    // Custom finder methods
    List<Interview> findByInterviewer(User interviewer);
    List<Interview> findByCandidateId(Long candidateId);
    List<Interview> findByDate(LocalDate date);
    List<Interview> findByStatus(String status);
    List<Interview> findByInterviewerAndDate(User interviewer, LocalDate date);
    List<Interview> findByRound(String round);
    
    // Check if interview exists for candidate and round
    @Query("SELECT COUNT(i) > 0 FROM Interview i WHERE i.candidate.id = :candidateId AND i.round = :round")
    boolean existsByCandidateIdAndRound(@Param("candidateId") Long candidateId, @Param("round") InterviewRound interviewRound);
    
    // Date-based queries
    List<Interview> findByDateAfter(LocalDate date);
    List<Interview> findByDateBefore(LocalDate date);
    List<Interview> findByDateBetween(LocalDate startDate, LocalDate endDate);
    
    // Custom JPQL queries
    @Query("SELECT i FROM Interview i WHERE i.date > :currentDate ORDER BY i.date ASC, i.time ASC")
    List<Interview> findUpcomingInterviewsSorted(@Param("currentDate") LocalDate currentDate);
    
    @Query("SELECT COUNT(i) FROM Interview i WHERE i.status = :status")
    long countByStatus(@Param("status") String status);
    
    @Query("SELECT i FROM Interview i WHERE i.date >= CURRENT_DATE AND i.interviewer = :interviewer ORDER BY i.date ASC")
    List<Interview> findUpcomingInterviewsByInterviewer(@Param("interviewer") User interviewer);
}