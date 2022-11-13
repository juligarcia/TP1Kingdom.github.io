precision mediump float;

struct PointLight {
  vec3 position;

  vec3 ambient;
  vec3 specular;
};

struct SpotLight {
  vec3 position;


  float theta;

  vec3 ambient;
  vec3 specular;
};

struct DirectLight {
  vec3 direction;

  vec3 ambient;
  vec3 specular;
};

struct Material {
  float kd, ks, ka, shininess;
  vec3 color;
};

vec3 calculateDirectLight(DirectLight light, vec3 normal, Material material, vec3 fragmentPosition) {
  vec3 N = normalize(normal);
  vec3 L = normalize(-light.direction);

  float lambertian = max(dot(N, L), 0.0);
  // float spec = 0.0;

  if(lambertian > 0.0){
    vec3 R = reflect(N, light.direction);
    vec3 V = normalize(-fragmentPosition);
    // spec = pow(max(dot(R, V), 0.0), material.shininess);
  }

  vec3 ambient  = light.ambient  * material.ka;
  vec3 diffuse  = material.color * lambertian * material.kd;
  vec3 specular = light.specular * material.ks;

  // esto lo puedo hacer manejando la intensidad con ad^2 + bd + c y a, b = 0
  return (ambient + diffuse + specular);
}

vec3 calculatePointLight(PointLight light, vec3 normal, Material material, vec3 fragmentPosition) {
  vec3 N = normalize(normal);
  vec3 L = normalize(light.position - fragmentPosition);

  float lambertian = max(dot(N, L), 0.0);
  float specular = 0.0;

  float d = length(light.position - fragmentPosition);
  float attenuation = 1.0 / (0.5 * d * d);

  if(lambertian > 0.0) {
    vec3 R = reflect(N, L);
    vec3 V = normalize(-fragmentPosition);
    float specAngle = max(dot(R, V), 0.0);
    specular = pow(specAngle, material.shininess);
  }

  return attenuation * (
    material.kd * lambertian * material.color +
    material.ks * specular * light.specular
  );
}

vec3 calculateSpotLight(SpotLight light, vec3 normal, Material material, vec3 fragmentPosition) {
  vec3 lightToPixel = normalize(fragmentPosition - light.position);
  float spot = dot(lightToPixel, vec3(light.position.x, 0, light.position.z));

  if (spot < cos(light.theta)) {
    PointLight auxLight = PointLight(light.position, light.ambient, light.specular);

    vec3 color = calculatePointLight(auxLight, normal, material, fragmentPosition);

    return spot * color;
  }

  return vec3(0, 0, 0);
}

// --------------------------------------------------------------------

varying vec3 vNormal;
varying vec3 vWorldPosition;

uniform bool isLightSource;

uniform DirectLight directLight;

uniform PointLight pLights[10];
uniform int totalPLights;

uniform SpotLight sLights[10];
uniform int totalSLights;

uniform Material material;

void main() {
  vec3 normal = vNormal;

  if(isLightSource) {
    normal = -vNormal;
  }

  vec3 result = calculateDirectLight(directLight, normal, material, vWorldPosition);

  for (int i = 0; i < 10; i++) {
    if(i < totalPLights) result += calculatePointLight(pLights[i], normal, material, vWorldPosition);
    else break;
  }

  gl_FragColor = vec4(result, 1.0);
}
