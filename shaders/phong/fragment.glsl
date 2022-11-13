precision mediump float;

struct PointLight {
  vec3 position;

  vec3 coefs;

  vec3 ambient;
  vec3 specular;
  vec3 diffuse;
};

struct SpotLight {
  vec3 position;

  vec3 coefs;

  vec3 ambient;
  vec3 specular;
  vec3 diffuse;

  float theta;

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

vec3 calculateDirectLight(DirectLight light, vec3 normal, Material material, vec3 fragmentPosition, vec3 observer) {
  vec3 N = normalize(normal);
  vec3 L = normalize(-light.direction);

  float lambertian = max(dot(N, L), 0.0);
  float spec = 0.0;

  if(lambertian > 0.0) {
    vec3 R = reflect(-L, N);
    vec3 V = normalize(-observer);
    float specAngle = max(dot(V, R), 0.0);
    spec = pow(specAngle, material.shininess);
  }

  vec3 ambient  = light.ambient  * material.ka;
  vec3 diffuse  = material.color * lambertian * material.kd;
  vec3 specular = spec * light.specular * material.ks;

  return (ambient + diffuse + specular);
}

vec3 calculatePointLight(PointLight light, vec3 normal, Material material, vec3 fragmentPosition, vec3 observer, bool isLightSource) {
  if(isLightSource) {
    normal = -normal;
  }

  vec3 N = normalize(normal);
  vec3 L = normalize(light.position - fragmentPosition);

  float lambertian = max(dot(N, L), 0.0);
  float specular = 0.0;

  float d = length(light.position - fragmentPosition);

  if (isLightSource) d = 0.01;

  float attenuation = 1.0 / (light.coefs.x * d * d + light.coefs.y * d + light.coefs.z);

  if(lambertian > 0.0) {
    vec3 R = reflect(-L, N);
    vec3 V = normalize(-observer);
    float specAngle = max(dot(V, R), 0.0);
    specular = pow(specAngle, material.shininess);
  }

  return attenuation * (
    material.ka * light.ambient +
    material.kd * lambertian * light.diffuse +
    material.ks * specular * light.specular
  );
}

vec3 calculateSpotLight(SpotLight light, vec3 normal, Material material, vec3 fragmentPosition, vec3 observer, bool isLightSource) {
  vec3 lightToPixel = normalize(fragmentPosition - light.position);
  float spot = max(dot(normalize(vec3(0, -light.position.y, 0)), lightToPixel), 0.0);

  if (spot >= cos(light.theta)) {
    PointLight auxLight = PointLight(light.position, light.coefs, light.ambient, light.specular, light.diffuse);

    vec3 color = calculatePointLight(auxLight, normal, material, fragmentPosition, observer, isLightSource);

    float factor = (1.0 - (1.0 - spot) / (1.0 - cos(light.theta)));

    return factor * color;
  }

  return vec3(0, 0, 0);
}

// --------------------------------------------------------------------

varying vec3 vNormal;
varying vec3 vWorldPosition;

uniform bool isLightSource;

uniform vec3 observer;

uniform DirectLight directLight;

uniform PointLight pLights[10];
uniform int totalPLights;

uniform SpotLight sLights[10];
uniform int totalSLights;

uniform Material material;

void main() {
  vec3 normal = vNormal;

  vec3 result = calculateDirectLight(directLight, normal, material, vWorldPosition, observer);

  for (int i = 0; i < 10; i++) {
    if(i < totalPLights) result += calculatePointLight(pLights[i], normal, material, vWorldPosition, observer, isLightSource);
    else break;
  }

  for (int i = 0; i < 10; i++) {
    if(i < totalSLights) result += calculateSpotLight(sLights[i], normal, material, vWorldPosition, observer, isLightSource);
    else break;
  }

  gl_FragColor = vec4(result, 1.0);
}
