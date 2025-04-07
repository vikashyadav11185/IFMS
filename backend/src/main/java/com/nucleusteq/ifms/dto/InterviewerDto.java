package com.nucleusteq.ifms.dto;

import java.util.Set;

import com.nucleusteq.ifms.model.Position;

public class InterviewerDto {
    private Long id;
    private String name;
    private String email;
    private Position position;
    private int assignedInterviews;

    // Constructors, getters, and setters
    public InterviewerDto() {}

    public InterviewerDto(Long id, String name, String email, Position position,  int assignedInterviews) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.position = position;
        this.assignedInterviews = assignedInterviews;
    }

    // Getters and setters
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

    public Position getPosition()
    {
    	return position;
    }
    public void setPosition(Position position)
    {
    	this.position = position;
    }

    public int getAssignedInterviews() {
        return assignedInterviews;
    }

    public void setAssignedInterviews(int assignedInterviews) {
        this.assignedInterviews = assignedInterviews;
    }
}