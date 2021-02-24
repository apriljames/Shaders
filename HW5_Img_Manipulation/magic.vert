#version 330 compatibility

out 	vec2 		vST;

uniform float	    sLoc;                //how far over in s values the lens is (s,t)
uniform float	    tLoc;                //how far up in t values the lens is (s,t)
uniform float	    width;                //width of lens
uniform float	    height;                //height of lens
uniform float	    uMagFactor;         //how much magnification in lens
uniform float	    uRotAngle;          //angle in radians to rotate image in the magic lens
uniform float	    uSharpFactor;       //sharpness of image.
uniform sampler2D	uImageUnit;         //texture image file: bmp, 24 bit 


void
main( )
{
	vST = gl_MultiTexCoord0.st;
	gl_Position = gl_ModelViewProjectionMatrix * gl_Vertex;
}