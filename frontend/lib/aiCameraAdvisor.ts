export interface RecommendedSettings {
  modeName: string;
  iso?: number;
  shutterSpeed?: string;
  shutterValue?: number;
  whiteBalance: 'auto' | 'daylight' | 'cloudy' | 'tungsten' | 'fluorescent' | 'manual';
  colorTemperature?: number; // Kelvin
  tint?: number; // Green (-50) to Magenta (+50)
  focusMode: 'auto' | 'manual';
  focusDistance?: number;
  exposureCompensation?: number; // EV
  tip: string;
  reasoning: string;
  hardwareNotes?: string;
}

export type EventPresetKey = 
  | 'wedding'
  | 'birthday'
  | 'corporate'
  | 'indoor_party'
  | 'outdoor_event'
  | 'stage'
  | 'group_photo'
  | 'portrait'
  | 'food'
  | 'product';

export type FilmStyleKey = 
  | 'process_zero'
  | 'natural'
  | 'vivid'
  | 'warm_vintage'
  | 'monochrome'
  | 'moody_matte'
  | 'high_contrast_bw'
  | 'soft_portrait'
  | 'beauty_glow'
  | 'neon_party';

export interface FilmStyle {
  key: FilmStyleKey;
  label: string;
  cssFilter: string;
  description: string;
  isProcessZero?: boolean;
}

export const FILM_STYLES: Record<FilmStyleKey, FilmStyle> = {
  process_zero: {
    key: 'process_zero',
    label: 'Halide Process Zero',
    cssFilter: 'contrast(1.08) saturate(1.05) brightness(0.98)',
    description: 'Raw filmic science without computational AI over-sharpening',
    isProcessZero: true,
  },
  natural: {
    key: 'natural',
    label: 'Standard TrueColor',
    cssFilter: 'none',
    description: 'Natural colors with neutral tone curve',
  },
  vivid: {
    key: 'vivid',
    label: 'Cinematic Vivid',
    cssFilter: 'saturate(1.28) contrast(1.12)',
    description: 'Vibrant punchy colors for celebration photos',
  },
  warm_vintage: {
    key: 'warm_vintage',
    label: 'Warm Memory',
    cssFilter: 'sepia(0.22) contrast(1.08) saturate(1.12) hue-rotate(-6deg)',
    description: 'Golden hour warmth for romantic event shots',
  },
  monochrome: {
    key: 'monochrome',
    label: 'Pro B&W Mono',
    cssFilter: 'grayscale(1) contrast(1.2)',
    description: 'Timeless black & white contrast',
  },
  moody_matte: {
    key: 'moody_matte',
    label: 'Moody Matte',
    cssFilter: 'contrast(0.94) saturate(0.88) brightness(1.02)',
    description: 'Filmic crushed shadows with soft highlights',
  },
  high_contrast_bw: {
    key: 'high_contrast_bw',
    label: 'Noir B&W',
    cssFilter: 'grayscale(1) contrast(1.45) brightness(0.94)',
    description: 'Dramatic high-contrast documentary look',
  },
  soft_portrait: {
    key: 'soft_portrait',
    label: 'Soft Portrait',
    cssFilter: 'contrast(0.96) brightness(1.04) saturate(1.06)',
    description: 'Flattering skin tone smoothing filter',
  },
  beauty_glow: {
    key: 'beauty_glow',
    label: '✨ Snap Beauty Glow',
    cssFilter: 'contrast(0.95) brightness(1.08) saturate(1.15) sepia(0.08)',
    description: 'Flattering smooth skin glow like Snapchat filters',
  },
  neon_party: {
    key: 'neon_party',
    label: '🎉 Neon Party Vibe',
    cssFilter: 'saturate(1.4) contrast(1.15) hue-rotate(10deg)',
    description: 'Vibrant popping colors for party lights & dancefloors',
  },
};

export interface EventPreset {
  key: EventPresetKey;
  label: string;
  icon: string;
  tagline: string;
  settings: RecommendedSettings;
}

export const EVENT_PRESETS: Record<EventPresetKey, EventPreset> = {
  wedding: {
    key: 'wedding',
    label: 'Wedding',
    icon: '💍',
    tagline: 'Warm skin tones & romantic ambiance',
    settings: {
      modeName: 'Wedding Preset',
      iso: 400,
      shutterSpeed: '1/125',
      shutterValue: 1 / 125,
      whiteBalance: 'manual',
      colorTemperature: 5200,
      tint: 5,
      focusMode: 'auto',
      exposureCompensation: 0.3,
      tip: 'Slightly boosted exposure for clean whites & glowing skin tones.',
      reasoning: 'Keeps bride & groom skin tones natural while preventing dark dress shadows.',
    },
  },
  birthday: {
    key: 'birthday',
    label: 'Birthday',
    icon: '🎂',
    tagline: 'Freeze cake candle actions & party laughs',
    settings: {
      modeName: 'Birthday Candle & Action',
      iso: 800,
      shutterSpeed: '1/160',
      shutterValue: 1 / 160,
      whiteBalance: 'auto',
      focusMode: 'auto',
      exposureCompensation: 0,
      tip: 'Fast shutter speed prevents motion blur during cake cutting & cheering.',
      reasoning: 'Higher ISO handles indoor ambient lighting without camera shake.',
    },
  },
  corporate: {
    key: 'corporate',
    label: 'Corporate',
    icon: '💼',
    tagline: 'Crisp presentation & neutral colors',
    settings: {
      modeName: 'Corporate & Conference',
      iso: 400,
      shutterSpeed: '1/125',
      shutterValue: 1 / 125,
      whiteBalance: 'manual',
      colorTemperature: 4500,
      focusMode: 'auto',
      exposureCompensation: 0,
      tip: 'Neutral white balance removes harsh indoor office / hall fluorescence.',
      reasoning: 'Delivers professional, true-to-life presentation slides & speaker photos.',
    },
  },
  indoor_party: {
    key: 'indoor_party',
    label: 'Indoor Party',
    icon: '🥳',
    tagline: 'Low-light optimization & warm glow',
    settings: {
      modeName: 'Indoor Party & Club',
      iso: 1600,
      shutterSpeed: '1/60',
      shutterValue: 1 / 60,
      whiteBalance: 'tungsten',
      colorTemperature: 3200,
      focusMode: 'auto',
      exposureCompensation: -0.3,
      tip: 'Higher ISO with tungsten color temperature balances ambient party lights.',
      reasoning: 'Captures venue lighting mood while preventing orange color cast.',
    },
  },
  outdoor_event: {
    key: 'outdoor_event',
    label: 'Outdoor Event',
    icon: '☀️',
    tagline: 'High shutter speed & vibrant daylight',
    settings: {
      modeName: 'Bright Outdoor & Festival',
      iso: 100,
      shutterSpeed: '1/500',
      shutterValue: 1 / 500,
      whiteBalance: 'daylight',
      colorTemperature: 5500,
      focusMode: 'auto',
      exposureCompensation: 0,
      tip: 'Lowest ISO ensures maximum dynamic range and crisp details under sunlight.',
      reasoning: 'Fast shutter prevents overexposure in bright natural light.',
    },
  },
  stage: {
    key: 'stage',
    label: 'Stage / Concert',
    icon: '🎤',
    tagline: 'Spotlight focus & motion freeze',
    settings: {
      modeName: 'Stage Performance',
      iso: 1200,
      shutterSpeed: '1/250',
      shutterValue: 1 / 250,
      whiteBalance: 'auto',
      focusMode: 'auto',
      exposureCompensation: -0.7,
      tip: 'Slightly underexpose to prevent spotlight highlight clipping on performers.',
      reasoning: 'High shutter freezes dance moves; spot focus pins performer facial expressions.',
    },
  },
  group_photo: {
    key: 'group_photo',
    label: 'Group Photo',
    icon: '👥',
    tagline: 'Deep focus to keep everyone sharp',
    settings: {
      modeName: 'Group Memory',
      iso: 400,
      shutterSpeed: '1/125',
      shutterValue: 1 / 125,
      whiteBalance: 'auto',
      focusMode: 'auto',
      exposureCompensation: 0,
      tip: 'Keep everyone sharp! Avoid ultra-shallow depth of field.',
      reasoning: 'Shutter speed >= 1/125s prevents group motion blur when guests smile or move.',
    },
  },
  portrait: {
    key: 'portrait',
    label: 'Portrait',
    icon: '👤',
    tagline: 'Flattering skin tones & shallow depth',
    settings: {
      modeName: 'Pro Portrait',
      iso: 200,
      shutterSpeed: '1/200',
      shutterValue: 1 / 200,
      whiteBalance: 'manual',
      colorTemperature: 5400,
      tint: 10,
      focusMode: 'auto',
      exposureCompensation: 0.3,
      tip: 'Use 2x telephoto lens if available for natural compression and background blur.',
      reasoning: 'Slight positive EV brightens skin tones for a magazine cover finish.',
    },
  },
  food: {
    key: 'food',
    label: 'Food & Drinks',
    icon: '🍕',
    tagline: 'Rich color saturation & close-up detail',
    settings: {
      modeName: 'Catering & Cocktails',
      iso: 200,
      shutterSpeed: '1/100',
      shutterValue: 1 / 100,
      whiteBalance: 'manual',
      colorTemperature: 5000,
      focusMode: 'manual',
      focusDistance: 0.2,
      exposureCompensation: 0.2,
      tip: 'Use manual focus with focus loupe to highlight dish textures.',
      reasoning: 'Warm color temperature makes culinary presentation pop.',
    },
  },
  product: {
    key: 'product',
    label: 'Product / Decor',
    icon: '🏷️',
    tagline: 'Clean grid alignment & crisp details',
    settings: {
      modeName: 'Event Decor & Sponsors',
      iso: 100,
      shutterSpeed: '1/125',
      shutterValue: 1 / 125,
      whiteBalance: 'daylight',
      colorTemperature: 5500,
      focusMode: 'auto',
      exposureCompensation: 0,
      tip: 'Enable Rule of Thirds grid to align sponsor logos & event details.',
      reasoning: 'Low ISO yields maximum clarity and sharp typography.',
    },
  },
};

export interface DeviceCapabilitiesSummary {
  hasISO: boolean;
  minISO?: number;
  maxISO?: number;
  hasShutterSpeed: boolean;
  minShutter?: number;
  maxShutter?: number;
  hasFocusMode: boolean;
  hasFocusDistance: boolean;
  hasWhiteBalance: boolean;
  hasColorTemperature: boolean;
  minTemp?: number;
  maxTemp?: number;
  hasExposureCompensation: boolean;
  minEV?: number;
  maxEV?: number;
  hasZoom: boolean;
  minZoom?: number;
  maxZoom?: number;
  hasTorch: boolean;
  cameraCount: number;
}

export function detectTrackCapabilities(track: MediaStreamTrack | null): DeviceCapabilitiesSummary {
  if (!track || typeof track.getCapabilities !== 'function') {
    return {
      hasISO: false,
      hasShutterSpeed: false,
      hasFocusMode: false,
      hasFocusDistance: false,
      hasWhiteBalance: false,
      hasColorTemperature: false,
      hasExposureCompensation: false,
      hasZoom: false,
      hasTorch: false,
      cameraCount: 1,
    };
  }

  try {
    const caps: any = track.getCapabilities();
    return {
      hasISO: 'iso' in caps,
      minISO: caps.iso?.min || 100,
      maxISO: caps.iso?.max || 6400,
      hasShutterSpeed: 'shutterSpeed' in caps,
      minShutter: caps.shutterSpeed?.min || 0.0001,
      maxShutter: caps.shutterSpeed?.max || 1,
      hasFocusMode: 'focusMode' in caps,
      hasFocusDistance: 'focusDistance' in caps,
      hasWhiteBalance: 'whiteBalanceMode' in caps,
      hasColorTemperature: 'colorTemperature' in caps,
      minTemp: caps.colorTemperature?.min || 2000,
      maxTemp: caps.colorTemperature?.max || 10000,
      hasExposureCompensation: 'exposureCompensation' in caps,
      minEV: caps.exposureCompensation?.min || -3,
      maxEV: caps.exposureCompensation?.max || 3,
      hasZoom: 'zoom' in caps,
      minZoom: caps.zoom?.min || 1,
      maxZoom: caps.zoom?.max || 5,
      hasTorch: 'torch' in caps,
      cameraCount: 1,
    };
  } catch (err) {
    return {
      hasISO: false,
      hasShutterSpeed: false,
      hasFocusMode: false,
      hasFocusDistance: false,
      hasWhiteBalance: false,
      hasColorTemperature: false,
      hasExposureCompensation: false,
      hasZoom: false,
      hasTorch: false,
      cameraCount: 1,
    };
  }
}

/**
 * Generate CSS Filter string for real-time live preview simulation of
 * ISO Gain, Exposure Compensation, Kelvin Color Temperature, Tint & Film Styles on WebKit (iOS Safari)
 */
export function computeViewportCSSFilter(
  ev: number,
  iso: number,
  kelvin: number,
  tint: number,
  filmStyleKey: FilmStyleKey
): string {
  const film = FILM_STYLES[filmStyleKey];
  const baseFilter = film ? film.cssFilter : 'none';

  // Exposure brightness factor: EV range -3 to +3 -> brightness 0.5 to 1.6
  const evBrightness = 1 + ev * 0.18;

  // ISO gain simulation (boost contrast/brightness slightly for high ISO)
  const isoGain = iso > 800 ? 1 + (iso - 800) * 0.00005 : 1;

  // Kelvin Color Temperature simulation (2000K warm orange -> 10000K cool blue)
  // 5500K is daylight neutral
  const kelvinShift = (kelvin - 5500) / 100; // -35 to +45
  const sepiaFactor = kelvin < 5500 ? Math.min(0.5, (5500 - kelvin) / 7000) : 0;
  const hueRotateDeg = kelvin > 5500 ? Math.min(20, (kelvin - 5500) / 250) : -sepiaFactor * 10;

  let combined = `brightness(${evBrightness * isoGain}) `;
  if (sepiaFactor > 0) combined += `sepia(${sepiaFactor}) `;
  if (Math.abs(hueRotateDeg) > 1) combined += `hue-rotate(${hueRotateDeg}deg) `;

  if (baseFilter !== 'none') {
    combined += `${baseFilter}`;
  }

  return combined.trim();
}

export interface RealtimeV2Analysis {
  luminance: number; // 0 to 255
  isLowLight: boolean;
  isOverexposed: boolean;
  isBacklit: boolean;
  motionScore: number;
  recommendation: string;
  suggestedPreset?: EventPresetKey;
}

let prevFrameData: Uint8ClampedArray | null = null;

export function analyzeFrameV2(canvas: HTMLCanvasElement, video: HTMLVideoElement): RealtimeV2Analysis {
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx || !video.videoWidth || !video.videoHeight) {
    return {
      luminance: 128,
      isLowLight: false,
      isOverexposed: false,
      isBacklit: false,
      motionScore: 0,
      recommendation: 'Camera stream active',
    };
  }

  canvas.width = 32;
  canvas.height = 32;
  ctx.drawImage(video, 0, 0, 32, 32);
  const imgData = ctx.getImageData(0, 0, 32, 32).data;

  let totalLuminance = 0;
  let centerLuminance = 0;
  let centerPixels = 0;
  let edgeLuminance = 0;
  let edgePixels = 0;

  for (let y = 0; y < 32; y++) {
    for (let x = 0; x < 32; x++) {
      const idx = (y * 32 + x) * 4;
      const r = imgData[idx];
      const g = imgData[idx + 1];
      const b = imgData[idx + 2];
      const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;

      totalLuminance += lum;

      if (x >= 8 && x < 24 && y >= 8 && y < 24) {
        centerLuminance += lum;
        centerPixels++;
      } else {
        edgeLuminance += lum;
        edgePixels++;
      }
    }
  }

  const avgLum = Math.round(totalLuminance / 1024);
  const avgCenter = Math.round(centerLuminance / (centerPixels || 1));
  const avgEdge = Math.round(edgeLuminance / (edgePixels || 1));

  const isBacklit = avgEdge > avgCenter + 45;
  const isLowLight = avgLum < 60;
  const isOverexposed = avgLum > 200;

  let motionScore = 0;
  if (prevFrameData && prevFrameData.length === imgData.length) {
    let diffSum = 0;
    for (let i = 0; i < imgData.length; i += 4) {
      diffSum += Math.abs(imgData[i] - prevFrameData[i]);
    }
    motionScore = Math.min(100, Math.round(diffSum / (1024 * 3)));
  }
  prevFrameData = new Uint8ClampedArray(imgData);

  let recommendation = 'Optimal exposure & balance.';
  let suggestedPreset: EventPresetKey | undefined = undefined;

  if (motionScore > 30) {
    recommendation = 'Fast motion detected — increase shutter speed to 1/250s to freeze subjects.';
    suggestedPreset = 'birthday';
  } else if (isBacklit) {
    recommendation = 'Strong backlight detected — apply +0.7 EV compensation to brighten subject.';
  } else if (isLowLight) {
    recommendation = 'Low ambient light — boost ISO to 800-1600 or switch to Indoor Party mode.';
    suggestedPreset = 'indoor_party';
  } else if (isOverexposed) {
    recommendation = 'High brightness detected — decrease ISO to 100 or increase shutter speed.';
    suggestedPreset = 'outdoor_event';
  }

  return {
    luminance: avgLum,
    isLowLight,
    isOverexposed,
    isBacklit,
    motionScore,
    recommendation,
    suggestedPreset,
  };
}
