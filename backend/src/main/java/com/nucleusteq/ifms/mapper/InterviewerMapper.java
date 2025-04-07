package com.nucleusteq.ifms.mapper;

import com.nucleusteq.ifms.dto.InterviewerDto;
import com.nucleusteq.ifms.model.Interviewer;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;

@Mapper(componentModel = "spring")
public interface InterviewerMapper {
    InterviewerMapper INSTANCE = Mappers.getMapper(InterviewerMapper.class);

    @Mapping(source = "assignedInterviews", target = "assignedInterviews")
    InterviewerDto toDto(Interviewer interviewer);

    @Mapping(source = "assignedInterviews", target = "assignedInterviews")
    Interviewer toEntity(InterviewerDto interviewerDto);
}