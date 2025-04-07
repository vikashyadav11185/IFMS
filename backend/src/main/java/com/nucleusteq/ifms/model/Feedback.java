package com.nucleusteq.ifms.model;

import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "feedback")
public class Feedback {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "interview_id", nullable = false)
    private Interview interview;

    @Enumerated(EnumType.STRING)
    private Decision decision;

    private String finalComments;
    
    @OneToMany(mappedBy = "feedback", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<SkillEvaluation> skillEvaluations = new ArrayList<>();
    // Constructors
    public Feedback() {
        this.skillEvaluations = new ArrayList<>();
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Interview getInterview() {
        return interview;
    }

    public void setInterview(Interview interview) {
        this.interview = interview;
    }

    public Decision getDecision() {
        return decision;
    }

    public void setDecision(Decision decision) {
        this.decision = decision;
    }

    public String getFinalComments() {
        return finalComments;
    }

    public void setFinalComments(String finalComments) {
        this.finalComments = finalComments;
    }

    public List<SkillEvaluation> getSkillEvaluations() {
        if (skillEvaluations == null) {
            skillEvaluations = new ArrayList<>();
        }
        return skillEvaluations;
    }

    public void setSkillEvaluations(List<SkillEvaluation> skillEvaluations) {
        if (skillEvaluations == null) {
            this.skillEvaluations = new ArrayList<>();
        } else {
            this.skillEvaluations = skillEvaluations;
        }
    }

    // Helper method to add skill evaluation
    public void addSkillEvaluation(SkillEvaluation skillEvaluation) {
        if (skillEvaluations == null) {
            skillEvaluations = new ArrayList<>();
        }
        skillEvaluation.setFeedback(this);
        skillEvaluations.add(skillEvaluation);
    }
}