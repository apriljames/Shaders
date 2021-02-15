#version 330 compatibility
/**********passed in from GLIB file******************/
uniform sampler2D uTexUnit; 
/***********passed b/w shader files******************/
out vec2 vST;

void main() {
	vST = gl_MultiTexCoord0.st;
	gl_Position = gl_ModelViewProjectionMatrix * gl_Vertex;
}