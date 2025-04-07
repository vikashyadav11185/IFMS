package com.nucleusteq.ifms.model;

import java.util.ArrayList;
import java.util.List;

public enum Position {
    JAVA_DEVELOPER,
    HUMAN_RESOURCE,
	DATA_ENGINEER,
	DEVOPS_ENGINEER,
	FRONTEND_DEVELOPER,
	BACKEND_DEVELOPER,
	PYTHON_DEVELOPER,
	SOFTWARE_ENGINEER;
	
	List<String> Positions = new ArrayList<String>();
	Object Stream() {
		// TODO Auto-generated method stub
		Positions.add("JAVA_DEVELOPER");
		Positions.add("HUMAN_RESOURCE");
		Positions.add("DATA_ENGINEER");
		Positions.add("DEVOPS_ENGINEER");
		Positions.add("FRONTEND_DEVELOPER");
		Positions.add("BACKEND_DEVELOPER");
		Positions.add("PYTHON_DEVELOPER");
		Positions.add("SOFTWARE_ENGINEER");
		return Positions;
	}
}