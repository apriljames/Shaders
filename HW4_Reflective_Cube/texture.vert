#version 330 compatibility
/**********passed in from GLIB file******************/
uniform 	float uLightX; 
uniform 	float uLightY;
uniform 	float uLightZ;

uniform		float uK;	//constant that controls amplitude of curtain's pleat fold 
uniform		float uP;	//period of curtain's sine wave

uniform		float uNoiseAmp;	//how tall the peaks are in the crinkle noise 
uniform		float uNoiseFreq;	//how frequent/close together the crinkles are 
uniform 	sampler3D Noise3;	//built-in 3d noise texture 

/*******pass to frag shader*****************/
out 		vec3 vLight;
out 		vec3 vEye;
out 		vec3 vNormal;

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


/********************************************/
//perform per-fragment lighting calculations
/********************************************/
void perFragLighting(vec4 glVertex) {
	vec4 vEyePos = gl_ModelViewMatrix * gl_Vertex;
	vec3 vLightPos = vec3( uLightX, uLightY, uLightZ );

	vLight = vLightPos - vEyePos.xyz; // vector from eye to light pos
	vEye = vec3( 0., 0., 0. ) - vEyePos.xyz; // vector from the origin to eye
}


/********************************************/
//rotate normal in a seemingly random way to create 
//a crinkled texture effect.
//pass in two angles to rotate the normal vector on x/y axes
/********************************************/
vec3 RotateNormal( float angx, float angy, vec3 n ) {
        float cx = cos( angx ); //cos x
        float sx = sin( angx ); //sin x
        float cy = cos( angy ); //cos y
        float sy = sin( angy ); //sin y 

        // rotate about x:
        float yp =  n.y*cx - n.z*sx;    // y'
        n.z      =  n.y*sx + n.z*cx;    // z'
        n.y      =  yp;
        // n.x      =  n.x;

        // rotate about y:
        float xp =  n.x*cy + n.z*sy;    // x'
        n.z      = -n.x*sy + n.z*cy;    // z'
        n.x      =  xp;
        // n.y      =  n.y;

        return normalize( n );
}



void main() {
	//calculate modified vertex positions (create curtain effect)
	vec4 modVertex = vec4(gl_Vertex.x, gl_Vertex.y, changeZ(), gl_Vertex.w);

	//get gl_position from modified vertex positions 
	gl_Position = gl_ModelViewProjectionMatrix * modVertex;

	//creating angles to perturb surface normals using texture
	vec3 vMC = modVertex.xyz;
	vec4 nvx = texture( Noise3, uNoiseFreq*vMC );
	float angx = nvx.r + nvx.g + nvx.b + nvx.a  -  2.;
	angx *= uNoiseAmp;

	vec4 nvy = texture( Noise3, uNoiseFreq*vec3(vMC.xy,vMC.z+0.5) );
	float angy = nvy.r + nvy.g + nvy.b + nvy.a  -  2.;
	angy *= uNoiseAmp;

	//calculate new surface normals 
	vec3 vNormalPreRotate = calculateNormals(modVertex);

	//perturb new surface normals to create crinkle texture
	vNormal = RotateNormal(angx, angy, vNormalPreRotate);

	//perform per-frag lighting calculations
	perFragLighting(modVertex);
}