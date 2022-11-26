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

vec3 calculateDirectLight(DirectLight light, vec3 normal, Material material, vec3 fragmentPosition, vec3 observer, vec3 texColor) {
  vec3 N = normalize(normal);
  vec3 L = normalize(-light.direction);

  float lambertian = max(dot(N, L), 0.0);
  float spec = 0.0;

  // if(lambertian > 0.0) {
    vec3 R = reflect(-L, N);
    vec3 V = normalize(observer);
    float specAngle = max(dot(V, R), 0.0);
    spec = pow(specAngle, material.shininess);
  // }

  vec3 ambient  = light.ambient  * material.ka;
  vec3 diffuse  = light.diffuse * lambertian * material.kd;
  vec3 specular = spec * light.specular * material.ks;

  return (ambient + diffuse + specular) * texColor;
}

vec3 calculatePointLight(PointLight light, vec3 normal, Material material, vec3 fragmentPosition, vec3 observer, bool isLightSource, bool isPointLight, vec3 texColor) {
  if (isLightSource && !isPointLight) {
    return vec3(0, 0, 0);
  }

  if (isLightSource) {
    return material.kd * light.diffuse * texColor;
  }

  vec3 N = normalize(normal);
  vec3 L = normalize(light.position - fragmentPosition);

  float lambertian = max(dot(N, L), 0.0);
  float specular = 0.0;

  float d = length(light.position - fragmentPosition);

  float attenuation = 1.0 / (light.coefs.x * d * d + light.coefs.y * d + light.coefs.z);

  if(lambertian > 0.0) {
    vec3 R = reflect(-L, N);
    vec3 V = normalize(observer);
    float specAngle = max(dot(R, V), 0.0);
    specular = pow(specAngle, material.shininess);
  }

  return attenuation * (
    material.ka * light.ambient +
    material.kd * lambertian * light.diffuse +
    material.ks * specular * light.specular
  ) * texColor;
}

vec3 calculateSpotLight(SpotLight light, vec3 normal, Material material, vec3 fragmentPosition, vec3 observer, bool isLightSource, bool isSpotLight, vec3 texColor) {
  if (isLightSource && !isSpotLight) {
    return vec3(0, 0, 0);
  }

  if (isLightSource) {
    return material.kd * light.diffuse * texColor;
  }

  vec3 lightToPixel = normalize(fragmentPosition - light.position);
  float spot = max(dot(normalize(vec3(0, -light.position.y, 0)), lightToPixel), 0.0);

  if (spot >= cos(light.theta)) {
    PointLight auxLight = PointLight(light.position, light.coefs, light.ambient, light.specular, light.diffuse);

    vec3 color = calculatePointLight(auxLight, normal, material, fragmentPosition, observer, isLightSource, false, texColor);

    float factor = (1.0 - (1.0 - spot) / (1.0 - cos(light.theta)));

    return factor * color * texColor;
  }

  return vec3(0, 0, 0);
}

// --------------------------------------------------------------------

varying vec3 vNormal;
varying vec3 vWorldPosition;
varying vec2 vUv;    
varying vec3 vBinormal;
varying vec3 vTangent;      

uniform bool isLightSource;
uniform bool isSpotLight;
uniform bool isPointLight;

uniform vec3 observer;

uniform DirectLight directLight;

uniform PointLight pLights[15];
uniform int totalPLights;

uniform SpotLight sLights[15];
uniform int totalSLights;

uniform Material material;

uniform bool showDirectLighting;
uniform bool showPointLighting;
uniform bool showSpotLighting;

uniform bool useNormalTextures;
uniform bool useTextures;
uniform bool useNormalMap;
uniform bool useGrid;

uniform bool hasTextures;

uniform sampler2D normalMapSampler;
uniform sampler2D textureSampler;

void main() {
  vec3 normalMapRGB = texture2D(normalMapSampler, vec2(vUv.x, vUv.y)).rgb * 2.0 - 1.0;
  vec3 texColor = useTextures && hasTextures ? vec3(texture2D(textureSampler, vec2(vUv.x, vUv.y)).rgb): material.color;

  vec3 normal = vNormal;

  if (useNormalTextures && hasTextures) normal = vTangent * normalMapRGB.x+ vNormal * normalMapRGB.z + vBinormal * normalMapRGB.y;

  if (useGrid) {
    gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
    return;
  }

  if (useNormalMap) {
    gl_FragColor = vec4(normal * 0.5 + 0.5, 1.0);
    return;
  }

  vec3 result;

  result = showDirectLighting ? calculateDirectLight(directLight, normal, material, vWorldPosition, observer, texColor) : vec3(0, 0, 0);

  if (showPointLighting) {
    for (int i = 0; i < 10; i++) {
      if(i < totalPLights) result += calculatePointLight(pLights[i], normal, material, vWorldPosition, observer, isLightSource, isPointLight, texColor);
      else break;
    }
  }

  if (showSpotLighting) {
    for (int i = 0; i < 10; i++) {
      if(i < totalSLights) result += calculateSpotLight(sLights[i], normal, material, vWorldPosition, observer, isLightSource, isSpotLight, texColor);
      else break;
    }
  }


  gl_FragColor = vec4(result, 1.0);
}
