#version 330 compatibility

out float vX, vY;
out vec2 vST;

void main() {
    vST = gl_MultiTexCoord0.st;
    vX = gl_Vertex.x;
    vY = gl_Vertex.y;
    gl_Position = gl_ModelViewProjectionMatrix * gl_Vertex;
}