#version 330 compatibility

uniform float uKa;                  //ambient reflectivity
uniform float uKd;                  //diffuse reflectivity
uniform float uKs;                  //specular reflectivity
uniform vec4 uColor;
uniform vec4 uSpecularColor;
uniform float uShininess;
flat in vec3 vNf;
in      vec3 vNs;                   //per-frag interpolated val from vertex shader (Normal)
flat in vec3 vLf;
in      vec3 vLs;                   //per-frag interpolated val from vertex shader (Light)
flat in vec3 vEf;
in      vec3 vEs;                   //per-frag interpolated val from vertex shader (Eye)

in 	vec3 vLight;    //per-frag interpolated val from vertex shader (Light)
in 	vec3 vEye;      //per-frag interpolated val from vertex shader (Eye)
in 	vec3 vNormal;   //per-frag interpolated val from vertex shader (Normal)

void main( ) {

    vec3 Normal;
    vec3 Light;
    vec3 Eye;

    //normalize the input lighting vectors
    Normal = normalize(vNormal);
    Light = normalize(vLight);
    Eye = normalize(vEye);
    
    vec4 ambient = uKa * uColor;
    float d = max( dot(Normal,Light), 0. );
    vec4 diffuse = uKd * d * uColor;
    float s = 0.;

    if( dot(Normal,Light) > 0. ) // only do specular if the light can see the point
    {
        vec3 ref = normalize( 2. * Normal * dot(Normal,Light) - Light );
        s = pow( max( dot(Eye,ref),0. ), uShininess );
    }

    vec4 specular = uKs * s * uSpecularColor;
    gl_FragColor = vec4( ambient.rgb + diffuse.rgb + specular.rgb, 1. );
}