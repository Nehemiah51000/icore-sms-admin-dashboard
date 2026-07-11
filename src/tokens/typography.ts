export const typography = {
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  scale: {
    xs: '0.75rem', // 12px — helper text, timestamps
    sm: '0.875rem', // 14px — secondary text, table cells
    base: '1rem', // 16px — body copy, form inputs
    lg: '1.125rem', // 18px — section headers
    xl: '1.5rem', // 24px — page titles
    '2xl': '2rem', // 32px — dashboard hero numbers
  },
  weight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
} as const;
