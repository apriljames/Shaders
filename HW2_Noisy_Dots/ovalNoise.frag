#version 330 compatibility

in vec3 vMCposition;
in float vLightIntensity;
in vec2 vST;
in vec4 vColor;

uniform float uAd;
uniform float uBd;
uniform float uNoiseAmp;
uniform float uNoiseFreq;
uniform float uTol;
uniform float uAlpha;
uniform vec4 uColor;
uniform vec4 uBackground;
uniform sampler2D Noise2;



void

main( )
{
    float Ar = uAd / 2.;
    float Br = uBd / 2.;
    float s = vST.s;
    float t = vST.t;
    
    vec4 Background = vec4( 1., 1., 1., 1.);

    int numins = int(s / uAd);
    int numint = int(t / uBd);

    float s_c = (numins * uAd) + Ar;                // s-coord of current ellipse center
    float ds = vST.s - s_c;                         // s-coord distance away from nearest ellipse center (starting to build ellipse equation)
    float t_c = (numint * uBd) + Br;                // t-coord of current ellipse center
    float dt = vST.t - t_c;                         // t-coord distance away from nearest ellipse center (starting to build ellipse equation)

    vec4 nv = texture(Noise2, uNoiseFreq * vST);    // read the glman 2D noise texture to create noise vector
    float n = nv.r + nv.g + nv.b + nv.a;            // give the noise a range of 1. -> 3.
    n = n - 2.;                                     // adjust range to -1. to 1.
    n = n * uNoiseAmp;                              // amplifies noise effect
    float oldDist = sqrt(ds*ds + dt*dt);            // old distance from current s,t to nearest ellipse center
    float newDist = oldDist + n;                    // add noise to actual input values to create new "fake" input values
    float scale = newDist / oldDist;                // can be <1., 1., or >1.

    ds = ds * scale;                                // scale by noise factor
    dt = dt * scale;

    ds = ds / Ar;                                   // building ellipse equation
    dt = dt / Br;   
    
    float ellipse = (ds * ds) + (dt * dt);
    
    float d = smoothstep( 1. - uTol, 1. + uTol, ellipse );

    // check if uAlpha is 0- instead of making transparency 0., use discard function 
    if ((ellipse >= (1.))&&(uAlpha==0.)) {
        discard;
    }

    // mix colors (vec3) together
    gl_FragColor = mix(vec4(vLightIntensity * uColor.rgb, 1.), vec4(vLightIntensity * uBackground), d);
    
    // set transparency (uAlpha) separately from mix statement
    if (ellipse >= (1.)) {                          // if not in an ellipse, set background transparency
        gl_FragColor.a = uAlpha;
    }
    else {                                          // if in an ellipse, force full opacity
        gl_FragColor.a = 1.;
    }
}