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
}

struct Material {
  float kd, ks, ka, shininess;
  vec3 color;
}

vec3 calculateDirectLight(DirectLight light, vec3 normal, Material material, vec3 fragmentPosition) {
  vec3 lightDirection = normalize(-light.direction);

  float diff = max(dot(normal, lightDirection), 0.0);
  vec3 reflectionDirection = reflect(-lightDirection, normal);
  float spec = pow(max(dot(fragmentPosition, reflectionDirection), 0.0), material.shininess);

  vec3 ambient  = light.ambient  * material.ka;
  vec3 diffuse  = material.color  * diff * material.kd;
  vec3 specular = light.specular * spec * material.ks;

  return (ambient + diffuse + specular);
}

vec3 calculatePointLight(PointLight light, vec3 normal, Material material, vec3 fragmentPosition) {
  vec3 N = normalize(normal);
  vec3 L = normalize(light.position - fragmentPosition);

  float lambertian = max(dot(N, L), 0.0);
  float specular = 0.0;

  float d = length(light.position - fragmentPosition)
  float attenuation = 1.0 / (1.0 * d + 1.0 * d * d)

  if(lambertian > 0.0) {
    vec3 R = reflect(N, L);
    vec3 V = normalize(-fragmentPosition);
    float specAngle = max(dot(R, V), 0.0);
    specular = pow(specAngle, material.shininess);
  }

  return attenuation * (material.ka * light.ambient + material.kd * lambertian * material.color + material.ks * specular * light.specular);
}

vec3 calculateSpotLight(SpotLight light, vec3 normal, Material material, vec3 fragmentPosition) {
  vec3 lightToPixel = normalize(fragmentPosition - light.position);
  float spot = dot(lightToPixel, vec3(light.position.x, 0, light.position.z));

  if (spot < cos(l.theta)) {
    PointLight auxLight = { .position = light.position, .ambient = light.ambient, .specular = light.specular, };

    color = calculatePointLight(auxLight, normal, material, fragmentPosition);

    return spot * color;
  }

  return vec3(0, 0, 0);
}
