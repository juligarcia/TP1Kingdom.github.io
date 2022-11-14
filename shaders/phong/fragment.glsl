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
  vec3 diffuse;
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
  vec3 diffuse  = light.diffuse * lambertian * material.kd;
  vec3 specular = spec * light.specular * material.ks;

  return (ambient + diffuse + specular) * material.color;
}

vec3 calculatePointLight(PointLight light, vec3 normal, Material material, vec3 fragmentPosition, vec3 observer, bool isLightSource, bool isPointLight) {
  if (isLightSource && !isPointLight) {
    return vec3(0, 0, 0);
  }

  if (isLightSource) {
    return material.kd * light.diffuse * material.color;
  }

  vec3 N = normalize(normal);
  vec3 L = normalize(light.position - fragmentPosition);

  float lambertian = max(dot(N, L), 0.0);
  float specular = 0.0;

  float d = length(light.position - fragmentPosition);

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
  ) * material.color;
}

vec3 calculateSpotLight(SpotLight light, vec3 normal, Material material, vec3 fragmentPosition, vec3 observer, bool isLightSource, bool isSpotLight) {
  if (isLightSource && !isSpotLight) {
    return vec3(0, 0, 0);
  }

  if (isLightSource) {
    return material.kd * light.diffuse * material.color;
  }

  vec3 lightToPixel = normalize(fragmentPosition - light.position);
  float spot = max(dot(normalize(vec3(0, -light.position.y, 0)), lightToPixel), 0.0);

  if (spot >= cos(light.theta)) {
    PointLight auxLight = PointLight(light.position, light.coefs, light.ambient, light.specular, light.diffuse);

    vec3 color = calculatePointLight(auxLight, normal, material, fragmentPosition, observer, isLightSource, false);

    float factor = (1.0 - (1.0 - spot) / (1.0 - cos(light.theta)));

    return factor * color * material.color;
  }

  return vec3(0, 0, 0);
}

// --------------------------------------------------------------------

varying vec3 vNormal;
varying vec3 vWorldPosition;

uniform bool isLightSource;
uniform bool isSpotLight;
uniform bool isPointLight;

uniform vec3 observer;

uniform DirectLight directLight;

uniform PointLight pLights[10];
uniform int totalPLights;

uniform SpotLight sLights[10];
uniform int totalSLights;

uniform Material material;

uniform bool showDirectLighting;
uniform bool showPointLighting;
uniform bool showSpotLighting;

uniform bool useNormalMap;
uniform bool useGrid;

void main() {
  vec3 normal = vNormal;

  vec3 result;

  if (useGrid) {
    gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);

    return;
  }

  if (useNormalMap) {
    result = normal * 0.5 + 0.5;
    gl_FragColor = vec4(result, 1.0);
    return;
  }

  result = showDirectLighting ? calculateDirectLight(directLight, normal, material, vWorldPosition, observer) : vec3(0, 0, 0);

  if (showPointLighting) {
    for (int i = 0; i < 10; i++) {
      if(i < totalPLights) result += calculatePointLight(pLights[i], normal, material, vWorldPosition, observer, isLightSource, isPointLight);
      else break;
    }
  }

  if (showSpotLighting) {
    for (int i = 0; i < 10; i++) {
      if(i < totalSLights) result += calculateSpotLight(sLights[i], normal, material, vWorldPosition, observer, isLightSource, isSpotLight);
      else break;
    }
  }


  gl_FragColor = vec4(result, 1.0);
}
