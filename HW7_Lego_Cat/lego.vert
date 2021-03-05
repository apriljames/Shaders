#version 330 compatibility

//shader in/out variables
out vec3 vNormal; //normal vector 

void main() {
    vNormal = normalize( gl_NormalMatrix * gl_Normal ); // calculate normal vector
    gl_Position = gl_Vertex;
}