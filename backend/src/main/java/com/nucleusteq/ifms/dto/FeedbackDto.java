package com.nucleusteq.ifms.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.util.ArrayList;
import java.util.List;

public class FeedbackDto {
    private Long id;
    
    @NotNull(message = "Interview ID cannot be null")
    private Long interviewId;
    
    @NotNull(message = "Candidate name cannot be null")
    private String candidateName;
    
    @NotNull(message = "Candidate email cannot be null")
    private String candidateEmail;
    
    @NotNull(message = "Candidate role cannot be null")
    private String candidateRole;
    
    @NotNull(message = "Interview date cannot be null")
    private String interviewDate;
    
    @NotNull(message = "Interviewer name cannot be null")
    private String interviewerName;
    
    @NotNull(message = "Decision cannot be null")
    private String decision;
    
    @NotNull(message = "Final comments cannot be null")
    private String finalComments;
    
    @NotEmpty(message = "At least one skill evaluation is required")
    private List<SkillEvaluationDto> skillEvaluations = new ArrayList<>();

    // Default constructor
    public FeedbackDto() {
    }

    // All-args constructor
    public FeedbackDto(Long id, Long interviewId, String candidateName, 
                     String candidateEmail, String candidateRole,
                     String interviewDate, String interviewerName,
                     String decision, String finalComments,
                     List<SkillEvaluationDto> skillEvaluations) {
        this.id = id;
        this.interviewId = interviewId;
        this.candidateName = candidateName;
        this.candidateEmail = candidateEmail;
        this.candidateRole = candidateRole;
        this.interviewDate = interviewDate;
        this.interviewerName = interviewerName;
        this.decision = decision;
        this.finalComments = finalComments;
        this.setSkillEvaluations(skillEvaluations); // Use setter for null safety
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getInterviewId() {
        return interviewId;
    }

    public void setInterviewId(Long interviewId) {
        this.interviewId = interviewId;
    }

    public String getCandidateName() {
        return candidateName;
    }

    public void setCandidateName(String candidateName) {
        this.candidateName = candidateName;
    }

    public String getCandidateEmail() {
        return candidateEmail;
    }

    public void setCandidateEmail(String candidateEmail) {
        this.candidateEmail = candidateEmail;
    }

    public String getCandidateRole() {
        return candidateRole;
    }

    public void setCandidateRole(String candidateRole) {
        this.candidateRole = candidateRole;
    }

    public String getInterviewDate() {
        return interviewDate;
    }

    public void setInterviewDate(String interviewDate) {
        this.interviewDate = interviewDate;
    }

    public String getInterviewerName() {
        return interviewerName;
    }

    public void setInterviewerName(String interviewerName) {
        this.interviewerName = interviewerName;
    }

    public String getDecision() {
        return decision;
    }

    public void setDecision(String decision) {
        this.decision = decision;
    }

    public String getFinalComments() {
        return finalComments;
    }

    public void setFinalComments(String finalComments) {
        this.finalComments = finalComments;
    }

    public List<SkillEvaluationDto> getSkillEvaluations() {
        if (skillEvaluations == null) {
            skillEvaluations = new ArrayList<>();
        }
        return skillEvaluations;
    }

    public void setSkillEvaluations(List<SkillEvaluationDto> skillEvaluations) {
        if (skillEvaluations == null) {
            this.skillEvaluations = new ArrayList<>();
        } else {
            this.skillEvaluations = skillEvaluations;
        }
    }

    // Helper method to add skill evaluation
    public void addSkillEvaluation(SkillEvaluationDto skillEvaluationDto) {
        getSkillEvaluations().add(skillEvaluationDto);
    }

    @Override
    public String toString() {
        return "FeedbackDto{" +
                "id=" + id +
                ", interviewId=" + interviewId +
                ", candidateName='" + candidateName + '\'' +
                ", candidateEmail='" + candidateEmail + '\'' +
                ", candidateRole='" + candidateRole + '\'' +
                ", interviewDate='" + interviewDate + '\'' +
                ", interviewerName='" + interviewerName + '\'' +
                ", decision='" + decision + '\'' +
                ", finalComments='" + finalComments + '\'' +
                ", skillEvaluations=" + skillEvaluations +
                '}';
    }
}