precision mediump float;

varying vec3 vNormal; // Surface normal
varying vec3 vWorldPosition;  // Vertex position

uniform float ka; // Ambient reflection coefficient
uniform float kd; // Diffuse reflection coefficient
uniform float ks; // Specular reflection coefficient
uniform float shininess; // Shininess
uniform mat4 uMMatrix;     // matriz de modelado


// Material color
uniform vec3 ambientColor;
uniform vec3 diffuseColor;
uniform vec3 specularColor;
uniform vec3 uLightPosition; // Light position, puedo tener mas de 1 luz resolver ese caso

void main() {
  vec4 lightPos = vec4(uLightPosition, 1.0);     

  vec3 N = normalize(vNormal);
  vec3 L = normalize(lightPos.xyz - vWorldPosition);

  // Lambert's cosine law
  float lambertian = max(dot(N, L), 0.0);
  float specular = 0.0;
  if(lambertian > 0.0) {
    vec3 R = reflect(N, L);  // Reflected light vector
    vec3 V = normalize(-vWorldPosition);  // Vector to viewer
    // Compute the specular term
    float specAngle = max(dot(R, V), 0.0);
    specular = pow(specAngle, shininess);
  }

  gl_FragColor = vec4(ka * ambientColor +
                      kd * lambertian * diffuseColor +
                      ks * specular * specularColor, 1.0);
}
