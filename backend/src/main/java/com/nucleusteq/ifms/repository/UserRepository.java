package com.nucleusteq.ifms.repository;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.nucleusteq.ifms.model.User;
import com.nucleusteq.ifms.model.Position;
import com.nucleusteq.ifms.model.Role;

public interface UserRepository extends JpaRepository<User, Long> {

    boolean existsByEmail(String email);
    User findByEmail(String email);
    @Query("SELECT u FROM User u WHERE u.role = :role")
    List<User> findByRole(@Param("role") Role role);
    
    @Query("SELECT u FROM User u WHERE u.position = :position AND u.role = 'INTERVIEWER'")
    List<User> findInterviewersByPosition(@Param("position") Position position);
    
    @Query("SELECT COUNT(u) FROM User u WHERE u.role = :role")
    long countByRole(@Param("role") Role role);
}