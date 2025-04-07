package com.nucleusteq.ifms.model;

import java.util.ArrayList;
import java.util.List;

public enum Role {
    HR_MANAGER,
    INTERVIEWER;
	List<String> Roles = new ArrayList<String>();
	Object Stream() {
		// TODO Auto-generated method stub
		Roles.add("HR_MANAGER");
		Roles.add("INTERVIEWER");
		
		return Roles;
	}
}