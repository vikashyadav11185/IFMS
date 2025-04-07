package com.nucleusteq.ifms.mapper;

import com.nucleusteq.ifms.dto.InterviewDto;
import com.nucleusteq.ifms.model.Candidate;
import com.nucleusteq.ifms.model.Interview;
import com.nucleusteq.ifms.model.InterviewStatus;
import com.nucleusteq.ifms.model.InterviewType;
import com.nucleusteq.ifms.model.User;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2025-04-06T22:38:12+0530",
    comments = "version: 1.5.5.Final, compiler: javac, environment: Java 17.0.7 (Eclipse Adoptium)"
)
@Component
public class InterviewMapperImpl implements InterviewMapper {

    @Override
    public InterviewDto toDto(Interview interview) {
        if ( interview == null ) {
            return null;
        }

        InterviewDto interviewDto = new InterviewDto();

        interviewDto.setCandidateId( interviewCandidateId( interview ) );
        interviewDto.setCandidateName( interviewCandidateName( interview ) );
        interviewDto.setCandidateEmail( interviewCandidateEmail( interview ) );
        interviewDto.setCandidateRole( interviewCandidateRoleApplied( interview ) );
        interviewDto.setInterviewerId( interviewInterviewerId( interview ) );
        interviewDto.setInterviewerName( interviewInterviewerFullName( interview ) );
        interviewDto.setId( interview.getId() );
        if ( interview.getRound() != null ) {
            interviewDto.setRound( interview.getRound().name() );
        }
        interviewDto.setDate( interview.getDate() );
        interviewDto.setTime( interview.getTime() );
        interviewDto.setDuration( interview.getDuration() );
        if ( interview.getType() != null ) {
            interviewDto.setType( interview.getType().name() );
        }
        interviewDto.setMeetingLink( interview.getMeetingLink() );
        interviewDto.setNotes( interview.getNotes() );
        if ( interview.getStatus() != null ) {
            interviewDto.setStatus( interview.getStatus().name() );
        }

        return interviewDto;
    }

    @Override
    public Interview toEntity(InterviewDto interviewDto) {
        if ( interviewDto == null ) {
            return null;
        }

        Interview interview = new Interview();

        interview.setId( interviewDto.getId() );
        interview.setDate( interviewDto.getDate() );
        interview.setTime( interviewDto.getTime() );
        interview.setDuration( interviewDto.getDuration() );
        if ( interviewDto.getType() != null ) {
            interview.setType( Enum.valueOf( InterviewType.class, interviewDto.getType() ) );
        }
        interview.setMeetingLink( interviewDto.getMeetingLink() );
        interview.setNotes( interviewDto.getNotes() );
        if ( interviewDto.getStatus() != null ) {
            interview.setStatus( Enum.valueOf( InterviewStatus.class, interviewDto.getStatus() ) );
        }

        interview.setRound( com.nucleusteq.ifms.model.InterviewRound.valueOf(interviewDto.getRound().toUpperCase()) );

        return interview;
    }

    private Long interviewCandidateId(Interview interview) {
        if ( interview == null ) {
            return null;
        }
        Candidate candidate = interview.getCandidate();
        if ( candidate == null ) {
            return null;
        }
        Long id = candidate.getId();
        if ( id == null ) {
            return null;
        }
        return id;
    }

    private String interviewCandidateName(Interview interview) {
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

    private String interviewCandidateEmail(Interview interview) {
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

    private String interviewCandidateRoleApplied(Interview interview) {
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

    private Long interviewInterviewerId(Interview interview) {
        if ( interview == null ) {
            return null;
        }
        User interviewer = interview.getInterviewer();
        if ( interviewer == null ) {
            return null;
        }
        Long id = interviewer.getId();
        if ( id == null ) {
            return null;
        }
        return id;
    }

    private String interviewInterviewerFullName(Interview interview) {
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
}
