        precision mediump float;

        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vWorldPosition;
        

        uniform vec3 uAmbientColor;         // color de luz ambiente
        uniform vec3 uDirectionalColor;	    // color de luz direccional
        uniform vec3 uLightPosition;        // posición de la luz
        
        uniform bool uUseLighting;          // usar iluminacion si/no
        uniform bool normalMap;
        uniform vec3 objectsColor;

        uniform sampler2D uSampler;

        void main(void) {
            
            vec3 lightDirection= normalize(uLightPosition - vec3(vWorldPosition));
            
            vec3 color=(uAmbientColor+uDirectionalColor*max(dot(vNormal,lightDirection), 0.0));
           
           color.x=normalize(objectsColor).x;
           color.y=normalize(objectsColor).y;
           color.z=normalize(objectsColor).z;

           color=(normalize(objectsColor)+uAmbientColor*0.2-uDirectionalColor*max(dot(vNormal,lightDirection), 0.0));

        if(normalMap){
            color.x=normalize(vNormal).x *0.5 + 0.5;
            color.y=normalize(vNormal).y *0.5 + 0.5;
            color.z=normalize(vNormal).z*0.5 + 0.5;
        }
           
            if (uUseLighting)
                gl_FragColor = vec4(color,1.0);
            else
                gl_FragColor = vec4(0.7,0.7,0.7,1.0);
            
        }