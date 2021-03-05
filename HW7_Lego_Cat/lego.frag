#version 330 compatibility

//shader in/out variables 
in float gLightIntensity; //in from geometry shader

//uniform variables passed from GLIB file
uniform vec4 uColor;

void main() {
    gl_FragColor = vec4(gLightIntensity * uColor.rgb, 1.); //quick and dirty lighting 
}