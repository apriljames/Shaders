#version 330 compatibility
/**********passed in from GLIB file******************/
uniform sampler2D uTexUnit; 
/***********passed b/w shader files******************/
in vec2 vST;

void main() {
	gl_FragColor = vec4(texture2D(uTexUnit, vST).rgb, 1.);
}