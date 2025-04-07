package com.nucleusteq.ifms.util;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

public class SkillUtils {

    public static List<String> getDefaultSkills() {
        return Arrays.asList(
            "Basic Algorithm",
            "Code and Syntax",
            "Design Patterns",
            "SQL",
            "Git",
            "Communication",
            "Overall Attitude",
            "Learning Ability",
            "Resume Explanation"
        );
    }

    public static List<String> getSkillsByRole(String role) {
        List<String> defaultSkills = getDefaultSkills();
        
        if (role.toLowerCase().contains("frontend")) {
            defaultSkills.add("HTML/CSS");
            defaultSkills.add("JavaScript");
            defaultSkills.add("React/Angular/Vue");
        } else if (role.toLowerCase().contains("backend")) {
            defaultSkills.add("System Design");
            defaultSkills.add("API Design");
            defaultSkills.add("Database Design");
        }
        
        return defaultSkills.stream().distinct().collect(Collectors.toList());
    }
}