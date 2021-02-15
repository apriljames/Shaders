#version 330 compatibility
/**********passed in from GLIB file******************/
uniform		float uK;	//constant that controls amplitude of curtain's pleat fold 
uniform		float uP;	//period of curtain's sine wave

uniform		float uNoiseAmp;	//how tall the peaks are in the crinkle noise 
uniform		float uNoiseFreq;	//how frequent/close together the crinkles are 
uniform 	sampler3D Noise3;	//built-in 3d noise texture 

/*******pass to frag shader*****************/
out 		vec3 vMCpos;
out 		vec3 vEs;
out 		vec3 vNormal;
out 		vec3 vECPos;
/*************constants/#defines*******************/
#define M_PI 3.1415926535897932384626433832795
float Y0 = 1.;	//setting position where y begins (location where "curtain rod" is on the y axis)


/********************************************/
//create curtain effect by modulating the z position as y changes
/********************************************/
float changeZ() {
	float x = gl_Vertex.x;
	float y = gl_Vertex.y;
	float z = uK*(Y0-y)*sin(2.*M_PI*x/uP);
	
	return z;
}


/********************************************/
//recalculate surface normals to fix lighting 
/********************************************/
vec3 calculateNormals(vec4 glVertex) {
	float x = glVertex.x;
	float y = glVertex.y;

	//calculating derivatives (surface slopes) on xz and yz axes
	float dzdx = uK * (Y0-y) * (2.*M_PI/uP) * cos(2.*M_PI*x/uP);
	float dzdy = -uK * sin(2.*M_PI*x/uP);

	//calculating tangent vectors from derivatives
	vec3 Tx = vec3(1., 0., dzdx);
	vec3 Ty = vec3(0., 1., dzdy);

	//calculate the normal vector by taking cross product of x/y tangent vectors 
	vec3 normalVec = cross(Tx,Ty);

	//normalize normal vector 
	return normalize(normalVec);
}




void main() {
	//calculate modified vertex positions (create curtain effect)
	vec4 modVertex = vec4(gl_Vertex.x, gl_Vertex.y, changeZ(), gl_Vertex.w);

	//get gl_position from modified vertex positions 
	gl_Position	= gl_ModelViewProjectionMatrix * modVertex;
	vECPos 	= (gl_ModelViewMatrix * modVertex).xyz;

	vNormal 	= normalize(gl_NormalMatrix * calculateNormals(modVertex));
	vEs 		= normalize(vECPos - vec3(0., 0., 0.)); 
	vMCpos 		= modVertex.xyz;
}