package com.nucleusteq.ifms.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "interviewers")
public class Interviewer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Size(max = 50)
    private String name;

    @NotBlank
    @Size(max = 50)
    @Email
    private String email;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Position position;
    
    private Integer assignedInterviews = 0;

    public Interviewer() {
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public Integer getAssignedInterviews() {
        return assignedInterviews;
    }

    public void setAssignedInterviews(Integer assignedInterviews) {
        this.assignedInterviews = assignedInterviews;
    }
    public Position getPosition()
    {
    	return position;
    }
	public void setPosition(Position position) {
		this.position = position;
		
	}
}