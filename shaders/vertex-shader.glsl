attribute vec3 aPosition;
attribute vec3 aNormal;
attribute vec3 aBinormal;
attribute vec3 aTangent;
attribute vec2 aUv;

uniform mat4 uVMatrix;     
uniform mat4 uPMatrix;
                        
varying vec3 vWorldPosition;
varying vec3 vNormal;
varying vec2 vUv;  
varying vec3 vBinormal;
varying vec3 vTangent;        
        
const float PI=3.141592653;

void main(void) {
    vec4 worldPos = vec4(aPosition, 1.0);                        

    gl_Position = uPMatrix * uVMatrix * worldPos;

    vWorldPosition = worldPos.xyz;              
    vNormal=normalize(aNormal);
    vBinormal=normalize(aBinormal);
    vTangent=normalize(aTangent);
    vUv = aUv;	
}