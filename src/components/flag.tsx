'use client'

/**
 * Flag component that renders country flags reliably across all platforms.
 * 
 * Uses SVG images from flagcdn.com (works on Windows/Mac/Linux/Android/iOS).
 * Emoji flags don't render on Windows (show as letter codes instead).
 */

const FLAG_CDN = 'https://flagcdn.com'

// Map of country name -> ISO 2-letter code (lowercase for flagcdn URL)
// This is a fallback when the country code isn't provided
const COUNTRY_TO_CODE: Record<string, string> = {
  France: 'fr', Germany: 'de', Belgium: 'be', Luxembourg: 'lu',
  Spain: 'es', Italy: 'it', Slovakia: 'sk', Austria: 'at',
  Greece: 'gr', Norway: 'no', Sweden: 'se', Switzerland: 'ch',
  Netherlands: 'nl', Malta: 'mt', Denmark: 'dk', Finland: 'fi',
  Hungary: 'hu', Portugal: 'pt', Latvia: 'lv', Lithuania: 'lt',
  Croatia: 'hr', Estonia: 'ee', Iceland: 'is', Liechtenstein: 'li',
  Bulgaria: 'bg', Romania: 'ro', Poland: 'pl', Slovenia: 'si',
  Czech: 'cz', USA: 'us', 'United Kingdom': 'gb', China: 'cn',
  Turkey: 'tr', Morocco: 'ma', India: 'in', Japan: 'jp', Mexico: 'mx',
  Russia: 'ru', Canada: 'ca', Australia: 'au', 'Saudi Arabia': 'sa',
  UAE: 'ae', Qatar: 'qa', Brazil: 'br', 'South Korea': 'kr',
}

export function Flag({ 
  country, 
  code, 
  flag, 
  size = 'md',
  className = ''
}: { 
  country?: string
  code?: string | null
  flag?: string | null
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}) {
  const sizes = {
    sm: 'h-3 w-4',
    md: 'h-4 w-5',
    lg: 'h-6 w-8',
    xl: 'h-8 w-12',
  }
  const sizeClass = sizes[size]
  
  // Get the ISO code (lowercase for flagcdn)
  const isoCode = (code || (country ? COUNTRY_TO_CODE[country] : '') || '').toLowerCase()
  
  if (!isoCode) {
    // Fallback to emoji flag or globe
    return <span className={className}>{flag || '🌍'}</span>
  }
  
  return (
    <img
      src={`${FLAG_CDN}/${isoCode}.svg`}
      alt={`${country || isoCode} flag`}
      className={`inline-block ${sizeClass} object-cover rounded-sm shadow-sm ${className}`}
      loading="lazy"
      onError={(e) => {
        // If SVG fails to load, fall back to emoji flag or globe
        const target = e.currentTarget
        const parent = target.parentElement
        if (parent) {
          const span = document.createElement('span')
          span.textContent = flag || '🌍'
          parent.replaceChild(span, target)
        }
      }}
    />
  )
}
