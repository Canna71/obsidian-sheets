// Sample theme color index
// const themeColorIndex = 1; // The theme color index (0-9)
// const tintVal = -0.5; // The tint value (-1 to 1)

// Sample Office Color Themes
const officeThemeColors = [
    [255, 255, 255], // White
    [0, 0, 0], // Black
    [238, 236, 225], // Tan
    [31, 73, 125], // Dark Blue
    [79, 129, 189], // Blue
    [192, 80, 77], // Red
    [155, 187, 89], // Green
    [128, 100, 162], // Purple
    [75, 172, 198], // Aqua
    [245, 150, 70], // Orange
];

const RGBToHSL = (r:number, g:number, b:number) => {
    r /= 255;
    g /= 255;
    b /= 255;
    const l = Math.max(r, g, b);
    const s = l - Math.min(r, g, b);
    const h = s
      ? l === r
        ? (g - b) / s
        : l === g
        ? 2 + (b - r) / s
        : 4 + (r - g) / s
      : 0;
    return [
      60 * h < 0 ? 60 * h + 360 : 60 * h,
      100 * (s ? (l <= 0.5 ? s / (2 * l - s) : s / (2 - (2 * l - s))) : 0),
      (100 * (2 * l - s)) / 2,
    ];
  };

// TODO: read theme from XML
export function convertThemeColorToRGB(
    themeColorIndex: number,
    tintVal: number
) {
    const baseColor = officeThemeColors[themeColorIndex];
    const baseHSL = RGBToHSL(baseColor[0],baseColor[1], baseColor[2]) //rgb2hsl(baseColor);
    const lumination = baseHSL[2];
    if (tintVal < 0) {
        baseHSL[2] = lumination * (1.0 + tintVal);
    } else {
        baseHSL[2] = lumination * (1.0 - tintVal) + 100 * tintVal;
    }

    // return HSLToRGB(baseHSL[0] / 360, baseHSL[1] / 100, baseHSL[2] / 100);
    return hsl2rgb(baseHSL[0], baseHSL[1] / 100, baseHSL[2] / 100);
}

// input: h as an angle in [0,360] and s,l in [0,1]
function hsl2rgb(h:number,s:number,l:number) 
{
   const a=s*Math.min(l,1-l);
   const f= (n:number,k=(n+h/30)%12) => l - a*Math.max(Math.min(k-3,9-k,1),-1);
   return [f(0)*255,f(8)*255,f(4)*255].map(Math.round);
}  

export function rgbToHex(r:number, g:number, b:number) {
    return r.toString(16) + g.toString(16) + b.toString(16);
}
