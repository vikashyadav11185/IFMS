package com.nucleusteq.ifms.mapper;

import com.nucleusteq.ifms.dto.InterviewerDto;
import com.nucleusteq.ifms.model.Interviewer;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2025-04-06T22:38:12+0530",
    comments = "version: 1.5.5.Final, compiler: javac, environment: Java 17.0.7 (Eclipse Adoptium)"
)
@Component
public class InterviewerMapperImpl implements InterviewerMapper {

    @Override
    public InterviewerDto toDto(Interviewer interviewer) {
        if ( interviewer == null ) {
            return null;
        }

        InterviewerDto interviewerDto = new InterviewerDto();

        if ( interviewer.getAssignedInterviews() != null ) {
            interviewerDto.setAssignedInterviews( interviewer.getAssignedInterviews() );
        }
        interviewerDto.setId( interviewer.getId() );
        interviewerDto.setName( interviewer.getName() );
        interviewerDto.setEmail( interviewer.getEmail() );
        interviewerDto.setPosition( interviewer.getPosition() );

        return interviewerDto;
    }

    @Override
    public Interviewer toEntity(InterviewerDto interviewerDto) {
        if ( interviewerDto == null ) {
            return null;
        }

        Interviewer interviewer = new Interviewer();

        interviewer.setAssignedInterviews( interviewerDto.getAssignedInterviews() );
        interviewer.setId( interviewerDto.getId() );
        interviewer.setName( interviewerDto.getName() );
        interviewer.setEmail( interviewerDto.getEmail() );
        interviewer.setPosition( interviewerDto.getPosition() );

        return interviewer;
    }
}
