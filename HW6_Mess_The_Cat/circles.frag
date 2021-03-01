#version 330 compatibility
uniform bool uScreen;
uniform vec4 uColor;
uniform int uMod;
uniform float uSide;
uniform bool uUseColor;
in float vX, vY;
in vec2 vST;


//function that keys off of t to return color 
vec3 Rainbow( float t )
{ 
    //t = t / 200.;
    float pi = 3.1415;
    float x = (sin(pi*t - 1.*pi/3.)) * 1.75 + 0.25;
    float y = (sin(pi*t + 1.*pi/3.)) * 1.75 + 0.25;
    float z = (sin(pi*t + 2.*pi/3.)) * 1.75 + 0.25;
    vec3 color = vec3(x, y, z);
    return color;   
}

void main( )
{
    vec2 xy;
    
    if( uScreen )
        xy = uSide * gl_FragCoord.xy; //gives screen/pixel space coordinate for each fragment's location 
    else
        xy = 100. * uSide * vST;

    // float z = dot( xy, xy ); // z = x^2 + y^2 (equation of circle)
    float z = pow(xy.x, 1.9) + pow(xy.y, 1.9);
    int c = int( z ); // round z to the nearest integer
    if( ( c % uMod ) != 0 )
    {
        if (uUseColor == true)
            gl_FragColor = vec4( uColor.rgb, 1. );
        else
            discard;
        
    }
    else
    {
        float t = float( c % 300 ) / 299.;
        vec3 rgb = Rainbow( t );
        gl_FragColor = vec4( rgb, 1. );
    }
}