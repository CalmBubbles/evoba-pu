#version 300 es

//
// NAME : "pu/Outline"
// TYPE : FRAGMENT
//

precision mediump float;

uniform sampler2D uSampler;

in vec2 vTexturePos;
in vec4 vColor;

out vec4 fragColor;

vec4 outlineColor = vec4(1.0, 1.0, 1.0, 1.0);
bool includeCorners = true;
float alphaThreshold = 0.5;

void main ()
{
    vec4 texelColor = texture(uSampler, vTexturePos) * vColor;

    if (texelColor.a >= alphaThreshold)
    {
        fragColor = texelColor;

        return;
    }
    
    vec2 oneTexel = 1.0 / vec2(textureSize(uSampler, 0));

    bool isOutline = texture(uSampler, vTexturePos + vec2(0.0, oneTexel.y)).a >= alphaThreshold ||
                     texture(uSampler, vTexturePos + vec2(0.0, -oneTexel.y)).a >= alphaThreshold ||
                     texture(uSampler, vTexturePos + vec2(oneTexel.x, 0.0)).a >= alphaThreshold ||
                     texture(uSampler, vTexturePos + vec2(-oneTexel.x, 0.0)).a >= alphaThreshold || (includeCorners && (
                        texture(uSampler, vTexturePos + vec2(oneTexel.x, oneTexel.y)).a >= alphaThreshold ||
                        texture(uSampler, vTexturePos + vec2(-oneTexel.x, oneTexel.y)).a >= alphaThreshold ||
                        texture(uSampler, vTexturePos + vec2(oneTexel.x, -oneTexel.y)).a >= alphaThreshold ||
                        texture(uSampler, vTexturePos + vec2(-oneTexel.x, -oneTexel.y)).a >= alphaThreshold
                     ));

    fragColor = isOutline ? outlineColor : fragColor;
}