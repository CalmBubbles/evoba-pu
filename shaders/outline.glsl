#version 300 es

//
// NAME : "pu/Outline"
// TYPE : FRAGMENT
//

precision mediump float;

uniform sampler2D uSampler;
uniform vec4 uTint;
uniform vec4 uOutlineColor;
uniform bool uIncludeCorners;
uniform float uAlphaThreshold;

in vec2 vTexturePos;
in vec4 vColor;

out vec4 fragColor;

void main ()
{
    vec4 texelColor = texture(uSampler, vTexturePos) * vColor;

    if (texelColor.a >= uAlphaThreshold)
    {
        fragColor = texelColor + uTint;

        return;
    }
    
    vec2 oneTexel = 1.0 / vec2(textureSize(uSampler, 0));

    bool isOutline = texture(uSampler, vTexturePos + vec2(0.0, oneTexel.y)).a >= uAlphaThreshold ||
                     texture(uSampler, vTexturePos + vec2(0.0, -oneTexel.y)).a >= uAlphaThreshold ||
                     texture(uSampler, vTexturePos + vec2(oneTexel.x, 0.0)).a >= uAlphaThreshold ||
                     texture(uSampler, vTexturePos + vec2(-oneTexel.x, 0.0)).a >= uAlphaThreshold || (uIncludeCorners && (
                        texture(uSampler, vTexturePos + vec2(oneTexel.x, oneTexel.y)).a >= uAlphaThreshold ||
                        texture(uSampler, vTexturePos + vec2(-oneTexel.x, oneTexel.y)).a >= uAlphaThreshold ||
                        texture(uSampler, vTexturePos + vec2(oneTexel.x, -oneTexel.y)).a >= uAlphaThreshold ||
                        texture(uSampler, vTexturePos + vec2(-oneTexel.x, -oneTexel.y)).a >= uAlphaThreshold
                     ));

    fragColor = (isOutline ? uOutlineColor : fragColor) + uTint;
}