package com.nucleusteq.ifms.mapper;

import com.nucleusteq.ifms.dto.FeedbackDto;
import com.nucleusteq.ifms.dto.SkillEvaluationDto;
import com.nucleusteq.ifms.model.Candidate;
import com.nucleusteq.ifms.model.Decision;
import com.nucleusteq.ifms.model.Feedback;
import com.nucleusteq.ifms.model.Interview;
import com.nucleusteq.ifms.model.Rating;
import com.nucleusteq.ifms.model.SkillEvaluation;
import com.nucleusteq.ifms.model.User;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2025-04-06T22:38:12+0530",
    comments = "version: 1.5.5.Final, compiler: javac, environment: Java 17.0.7 (Eclipse Adoptium)"
)
@Component
public class FeedbackMapperImpl implements FeedbackMapper {

    @Override
    public FeedbackDto toDto(Feedback feedback) {
        if ( feedback == null ) {
            return null;
        }

        FeedbackDto feedbackDto = new FeedbackDto();

        feedbackDto.setInterviewId( feedbackInterviewId( feedback ) );
        feedbackDto.setCandidateName( feedbackInterviewCandidateName( feedback ) );
        feedbackDto.setCandidateEmail( feedbackInterviewCandidateEmail( feedback ) );
        feedbackDto.setCandidateRole( feedbackInterviewCandidateRoleApplied( feedback ) );
        LocalDate date = feedbackInterviewDate( feedback );
        if ( date != null ) {
            feedbackDto.setInterviewDate( DateTimeFormatter.ISO_LOCAL_DATE.format( date ) );
        }
        feedbackDto.setInterviewerName( feedbackInterviewInterviewerFullName( feedback ) );
        feedbackDto.setId( feedback.getId() );
        if ( feedback.getDecision() != null ) {
            feedbackDto.setDecision( feedback.getDecision().name() );
        }
        feedbackDto.setFinalComments( feedback.getFinalComments() );
        feedbackDto.setSkillEvaluations( skillEvaluationListToSkillEvaluationDtoList( feedback.getSkillEvaluations() ) );

        return feedbackDto;
    }

    @Override
    public Feedback toEntity(FeedbackDto feedbackDto) {
        if ( feedbackDto == null ) {
            return null;
        }

        Feedback feedback = new Feedback();

        feedback.setId( feedbackDto.getId() );
        if ( feedbackDto.getDecision() != null ) {
            feedback.setDecision( Enum.valueOf( Decision.class, feedbackDto.getDecision() ) );
        }
        feedback.setFinalComments( feedbackDto.getFinalComments() );
        feedback.setSkillEvaluations( skillEvaluationDtoListToSkillEvaluationList( feedbackDto.getSkillEvaluations() ) );

        return feedback;
    }

    private Long feedbackInterviewId(Feedback feedback) {
        if ( feedback == null ) {
            return null;
        }
        Interview interview = feedback.getInterview();
        if ( interview == null ) {
            return null;
        }
        Long id = interview.getId();
        if ( id == null ) {
            return null;
        }
        return id;
    }

    private String feedbackInterviewCandidateName(Feedback feedback) {
        if ( feedback == null ) {
            return null;
        }
        Interview interview = feedback.getInterview();
        if ( interview == null ) {
            return null;
        }
        Candidate candidate = interview.getCandidate();
        if ( candidate == null ) {
            return null;
        }
        String name = candidate.getName();
        if ( name == null ) {
            return null;
        }
        return name;
    }

    private String feedbackInterviewCandidateEmail(Feedback feedback) {
        if ( feedback == null ) {
            return null;
        }
        Interview interview = feedback.getInterview();
        if ( interview == null ) {
            return null;
        }
        Candidate candidate = interview.getCandidate();
        if ( candidate == null ) {
            return null;
        }
        String email = candidate.getEmail();
        if ( email == null ) {
            return null;
        }
        return email;
    }

    private String feedbackInterviewCandidateRoleApplied(Feedback feedback) {
        if ( feedback == null ) {
            return null;
        }
        Interview interview = feedback.getInterview();
        if ( interview == null ) {
            return null;
        }
        Candidate candidate = interview.getCandidate();
        if ( candidate == null ) {
            return null;
        }
        String roleApplied = candidate.getRoleApplied();
        if ( roleApplied == null ) {
            return null;
        }
        return roleApplied;
    }

    private LocalDate feedbackInterviewDate(Feedback feedback) {
        if ( feedback == null ) {
            return null;
        }
        Interview interview = feedback.getInterview();
        if ( interview == null ) {
            return null;
        }
        LocalDate date = interview.getDate();
        if ( date == null ) {
            return null;
        }
        return date;
    }

    private String feedbackInterviewInterviewerFullName(Feedback feedback) {
        if ( feedback == null ) {
            return null;
        }
        Interview interview = feedback.getInterview();
        if ( interview == null ) {
            return null;
        }
        User interviewer = interview.getInterviewer();
        if ( interviewer == null ) {
            return null;
        }
        String fullName = interviewer.getFullName();
        if ( fullName == null ) {
            return null;
        }
        return fullName;
    }

    protected SkillEvaluationDto skillEvaluationToSkillEvaluationDto(SkillEvaluation skillEvaluation) {
        if ( skillEvaluation == null ) {
            return null;
        }

        SkillEvaluationDto skillEvaluationDto = new SkillEvaluationDto();

        skillEvaluationDto.setId( skillEvaluation.getId() );
        skillEvaluationDto.setSkill( skillEvaluation.getSkill() );
        if ( skillEvaluation.getRating() != null ) {
            skillEvaluationDto.setRating( skillEvaluation.getRating().name() );
        }
        skillEvaluationDto.setTopics( skillEvaluation.getTopics() );
        skillEvaluationDto.setComments( skillEvaluation.getComments() );

        return skillEvaluationDto;
    }

    protected List<SkillEvaluationDto> skillEvaluationListToSkillEvaluationDtoList(List<SkillEvaluation> list) {
        if ( list == null ) {
            return null;
        }

        List<SkillEvaluationDto> list1 = new ArrayList<SkillEvaluationDto>( list.size() );
        for ( SkillEvaluation skillEvaluation : list ) {
            list1.add( skillEvaluationToSkillEvaluationDto( skillEvaluation ) );
        }

        return list1;
    }

    protected SkillEvaluation skillEvaluationDtoToSkillEvaluation(SkillEvaluationDto skillEvaluationDto) {
        if ( skillEvaluationDto == null ) {
            return null;
        }

        SkillEvaluation skillEvaluation = new SkillEvaluation();

        skillEvaluation.setId( skillEvaluationDto.getId() );
        skillEvaluation.setSkill( skillEvaluationDto.getSkill() );
        if ( skillEvaluationDto.getRating() != null ) {
            skillEvaluation.setRating( Enum.valueOf( Rating.class, skillEvaluationDto.getRating() ) );
        }
        skillEvaluation.setTopics( skillEvaluationDto.getTopics() );
        skillEvaluation.setComments( skillEvaluationDto.getComments() );

        return skillEvaluation;
    }

    protected List<SkillEvaluation> skillEvaluationDtoListToSkillEvaluationList(List<SkillEvaluationDto> list) {
        if ( list == null ) {
            return null;
        }

        List<SkillEvaluation> list1 = new ArrayList<SkillEvaluation>( list.size() );
        for ( SkillEvaluationDto skillEvaluationDto : list ) {
            list1.add( skillEvaluationDtoToSkillEvaluation( skillEvaluationDto ) );
        }

        return list1;
    }
}
