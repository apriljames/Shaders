#version 330 compatibility

in     vec2        vST;

uniform float	    sLoc;                //how far over in s values the lens is (s,t)
uniform float	    tLoc;                //how far up in t values the lens is (s,t)
uniform float	    width;                //width of lens
uniform float	    height;                //height of lens
uniform float       radius;             //radius of lens
uniform float	    uMagFactor;         //how much magnification in lens
uniform float	    uRotAngle;          //angle in radians to rotate image in the magic lens
uniform float	    uSharpFactor;       //sharpness of image.
uniform sampler2D	uImageUnit;         //texture image file: bmp, 24 bit 
uniform bool        Circle;

//distance b/w (s,t) texels
float   STexel; //to get to neighboring (s,t): +/- (STexel, TTexel)
float   TTexel; //to get to neighboring (s,t): +/- (STexel, TTexel)

//lens bounds for rect lens
float leftBound; 
float rightBound;
float topBound;
float botBound;
//lens bound for circular lens
float distBound; 


//calculate values to get from current texel's (s,t) to neighboring (s,t)
void calcResolution() {
    ivec2 ires = textureSize( uImageUnit, 0 );
    float ResS = float(ires.s);
    float ResT = float(ires.t);
    STexel = 1./ResS;
    TTexel = 1./ResT;
}

//calculate the bounds of a rectangular lens
void calcRectLensBounds() {
    leftBound = sLoc-0.5*width;
    rightBound = sLoc+0.5*width;
    topBound = tLoc+0.5*height;
    botBound = tLoc-0.5*height;
}

void calcCircLensDistance(vec2 v) {
    distBound = sqrt(pow((v.s - sLoc), 2) + pow((v.t - tLoc), 2));
}

//enlargens the image based on a scaling factor
vec2 scaleImg(vec2 v, float mag) {
    v.s *= (1./mag);
    v.t *= (1./mag);
    return v;
}

//rotate current (s,t) in circle based on given angle
vec2 rotateImg(vec2 v, float angle) {
    vec2 vOut;
    vOut.s = v.s*cos(angle) - v.t*sin(angle);
    vOut.t = v.s*sin(angle) + v.t*cos(angle);
    return vOut;
}

//function to "sharpen" image 
vec3 sharpenMix(vec2 v){
    vec2 stp0 = vec2(STexel, 0. );
    vec2 st0p = vec2(0. , TTexel);
    vec2 stpp = vec2(STexel, TTexel);
    vec2 stpm = vec2(STexel, -TTexel);
    //sample rgb values within a radius of 4
    vec3 i00 = texture2D( uImageUnit, v ).rgb;
    vec3 im1m1 = texture2D( uImageUnit, v-stpp ).rgb;
    vec3 ip1p1 = texture2D( uImageUnit, v+stpp ).rgb;
    vec3 im1p1 = texture2D( uImageUnit, v-stpm ).rgb;
    vec3 ip1m1 = texture2D( uImageUnit, v+stpm ).rgb;
    vec3 im10 = texture2D( uImageUnit, v-stp0 ).rgb;
    vec3 ip10 = texture2D( uImageUnit, v+stp0 ).rgb;
    vec3 i0m1 = texture2D( uImageUnit, v-st0p ).rgb;
    vec3 i0p1 = texture2D( uImageUnit, v+st0p ).rgb;
    //sharpening equation 
    vec3 target = vec3(0.,0.,0.);
    target += 1.*(im1m1+ip1m1+ip1p1+im1p1);
    target += 2.*(im10+ip10+i0m1+i0p1);
    target += 4.*(i00);
    target /= 16.;
    //mix b/w sharp and original rgb values based on sharpening factor 
    return mix(target, i00, uSharpFactor);
}

void

main( )
{   
    bool isLensCircle = Circle;
    bool inBounds = false; 
    
    vec2 vSTmod = vST; //modify s,t without ruining original values 
    calcResolution(); 

    //lens is a circle
    if (Circle) {
        calcCircLensDistance(vSTmod);
        if (distBound < radius) {
            inBounds = true;
        }
        else {
            inBounds = false;
        }
    }
    //lens is a rectangle
    else {
        calcRectLensBounds();
        if ((vST.s >= leftBound) && (vST.s <= rightBound) && (vST.t >= botBound) && (vST.t <= topBound)) {
            inBounds = true;
        }
        else {
            inBounds = false;
        }
    }

    calcRectLensBounds();

    //if current fragment is within lens, do the magic
    if ( inBounds ) { //checking bounds of lens
        //translate so the current (s,t) is origin
        vSTmod.s = vSTmod.s - sLoc;
        vSTmod.t = vSTmod.t - tLoc;

        //rotate
        vSTmod = rotateImg(vSTmod, uRotAngle);
        //magnify
        vSTmod = scaleImg(vSTmod, uMagFactor);

        //translate back to original (s,t) 
        vSTmod.s = vSTmod.s + sLoc;
        vSTmod.t = vSTmod.t + tLoc;

        vec3 vSharpenMix = sharpenMix(vSTmod);

        //gl_FragColor = vec4(texture2D(uImageUnit, vSTmod).rgb, 1.);
        gl_FragColor = vec4(vSharpenMix, 1.);
    }

    //if fragment is outside of lens, perform a normal texture lookup, life is good
    else {
        gl_FragColor = vec4(texture2D(uImageUnit, vST).rgb, 1.);
    }
    
}