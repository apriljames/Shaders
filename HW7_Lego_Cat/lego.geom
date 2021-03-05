#version 330 compatibility
#extension GL_EXT_gpu_shader4: enable
#extension GL_EXT_geometry_shader4: enable

layout( triangles )  in;                            //define what storage looks like 
layout( triangle_strip, max_vertices=204 )  out;    //define what storage looks like 

//shader in/out variables 
in vec3 vNormal[3];                                 //from vert
out float gLightIntensity;                          //to frag

//uniform variables passed from GLIB file
uniform int uLevel;
uniform float uQuantize;
uniform bool uModelCoords;
uniform float uLightX;
uniform float uLightY;
uniform float uLightZ;

//other variables 
const vec3 LIGHTPOS = vec3(0., 10., 0.);            //position of light source

vec3 V0;                                            //positions of the three original triangle vertices 
vec3 V01;
vec3 V02;

vec3 N0;                                            //normals of the three original triangle vertices
vec3 N01;
vec3 N02;





// quantize single value 
float Quantize( float f ) {
	f *= uQuantize;
	f += .5;		// round-off
	int fi = int( f );
	f = float( fi ) / uQuantize;
	return f;
}


vec3 QuantizedVertex( float s, float t ) {
	vec3 v = V0 + s*V01 + t*V02;		// interpolate the vertex from s and t

	if( !uModelCoords )
	{
		v = ( gl_ModelViewMatrix * vec4( v, 1 ) ).xyz;
	}

	v.x = Quantize( v.x );
	v.y = Quantize( v.y );
	v.z = Quantize( v.z );
	return v;
}

void ProduceVertex( float s, float t ) {
	vec3 lightPos = vec3( uLightX, uLightY, uLightZ );
	vec3 v = QuantizedVertex( s, t );

	vec3 n = N0 + s*N01 + t*N02;	// interpolate the normal from s and t
	vec3 tnorm = gl_NormalMatrix * n;	// transformed normal

	vec4 ECposition;

	if( uModelCoords )
	{
		ECposition = gl_ModelViewMatrix * vec4( v, 1. );
	}
	else
	{
		ECposition = vec4( v, 1. );
	}

	gLightIntensity  = dot(normalize(lightPos - ECposition.xyz), tnorm);
    gLightIntensity = abs(gLightIntensity);

	gl_Position = gl_ProjectionMatrix * ECposition;
	EmitVertex();
}



void main() {
    // subdividing triangle into smaller triangles :

    //set up s & t interpolation:
    V01 = ( gl_PositionIn[1] - gl_PositionIn[0] ).xyz;
    V02 = ( gl_PositionIn[2] - gl_PositionIn[0] ).xyz;
    V0  =   gl_PositionIn[0].xyz;
    // normals
    N01 =  vNormal[1] - vNormal[0];
    N02 =  vNormal[2] - vNormal[0];
    N0  =  vNormal[0];

    // use bitshifting to calculate how many layers to divide the triangle into 
    int numLayers = 1 << uLevel;

    float dt = 1. / float(numLayers); // t ranges from 0-1. This divides t into # of layers to iterate through
    float t_top = 1.; //value of t at the top of the triangle


    // subdivide the original triangle geometry into triangle strips 
    for (int tIndex=0; tIndex < numLayers; tIndex++) {  // loop through the # of layers 
        float t_bot = t_top - dt;                       // value of t at the bottom of the current strip 
        float s_max_top = 1. - t_top;                   // max s value on the strip assuming the top vertex of the triangle has s&t of (1,0)
        float s_max_bot = 1. - t_bot;                   // min value of s on the strip

        int nums = tIndex + 1;
        float ds_top = s_max_top / float(nums - 1);     // distance of s values b/w each vertex on the top of the triangle strip 
        float ds_bot = s_max_bot / float(nums);         // distance of s values b/w each vertex on the top of the triangle strip (+1 from top because pyramid shape creates an extra triangle on the bottom)

        float s_top = 0.;
        float s_bot = 0.;

        for (int sIndex=0; sIndex < nums; sIndex++) {   // loop through all points on the top of the triangle strip 
            ProduceVertex(s_bot, t_bot);    
            ProduceVertex(s_top, t_top);
            s_top += ds_top;                            // increment s values along the strip (t values don't change laterally )
            s_bot += ds_bot;
        }

        ProduceVertex(s_bot, t_bot);                    // perform calculations for the last vertex on the bottom right side of the strip (bottom has one more point than top of strip)
        EndPrimitive();                                 // end of strip! 

        t_top = t_bot;                                  // decrement t values to move to the next triangle strip directly below
        t_bot -= dt;
    
    }

}