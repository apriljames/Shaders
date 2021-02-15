#version 330 compatibility
/**********passed in from GLIB file******************/
uniform		float uK;	//constant that controls amplitude of curtain's pleat fold 
uniform		float uP;	//period of curtain's sine wave

uniform		float uNoiseAmp;	//how tall the peaks are in the crinkle noise 
uniform		float uNoiseFreq;	//how frequent/close together the crinkles are 
uniform 	sampler3D Noise3;	//built-in 3d noise texture 

uniform     samplerCube uReflectUnit; //reference images used for reflecion
uniform     samplerCube uRefractUnit; //reference images used for refraction

uniform     float uEta;         //index of refraction
uniform     float uMix;         //blend b/w reflection/refraction
/*******passed from vert shader*****************/
in 		    vec3 vMCpos;
in 		    vec3 vEs;
in 		    vec3 vNormal;
in 		    vec3 vECPos;

/*************constants/#defines*******************/
const       vec4 WHITE = vec4(1., 1., 1., 1.);




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

    vec4 nvx = texture( Noise3, uNoiseFreq*vMCpos );
	float angx = nvx.r + nvx.g + nvx.b + nvx.a  -  2.; //-1 to 1
	angx *= uNoiseAmp;

	vec4 nvy = texture( Noise3, uNoiseFreq*vec3(vMCpos.xy,vMCpos.z+0.5) );
	float angy = nvy.r + nvy.g + nvy.b + nvy.a  -  2.; //-1 to 1
	angy *= uNoiseAmp;

    vec3 Normal = normalize(vNormal);
    Normal = RotateNormal(angy, angx, Normal);
    


    vec3 reflectVector = reflect(vECPos, Normal);
    vec4 reflectColor = texture(uReflectUnit, reflectVector);
    vec3 refractVector = refract(vECPos, Normal, uEta);
    vec4 refractColor;

    if( all( equal( refractVector, vec3(0.,0.,0.) ) ) )
	{
		refractColor = reflectColor;
	}
	else
	{
		refractColor = texture( uRefractUnit, refractVector );
		refractColor = mix( refractColor, WHITE, 0.30 );
	}

    gl_FragColor = mix(reflectColor, refractColor, uMix);
}