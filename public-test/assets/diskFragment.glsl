uniform float time;
varying vec2 vUv;

void main() {
    vec2 centerUV = vUv - 0.5;
    float radius = length(centerUV);

    // base glow shape
    float glow = 1.0 - smoothstep(0.2, 0.6, radius);

    // pulsing animation
    glow *= 0.7 + 0.3 * sin(10.0 * radius - time * 2.0);

    // color: orange/yellow
    vec3 color = vec3(glow, glow * 0.5, glow * 0.1);

    gl_FragColor = vec4(color, glow);
}
