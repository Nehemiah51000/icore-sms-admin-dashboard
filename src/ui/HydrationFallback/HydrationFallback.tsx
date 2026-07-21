interface HydrationFallbackProps {
  appName?: string;
  subtitle?: string;
  logoSrc?: string;
}

export function HydrationFallback({
  appName = 'ICORE Systems',
  subtitle = 'Authenticating session...',
  logoSrc = '/ICORE_logo_last_iteration.svg',
}: HydrationFallbackProps) {
  return (
    <div className='min-h-screen bg-bg-base flex flex-col items-center justify-center p-4 transition-colors duration-200 select-none'>
      <div className='flex flex-col items-center gap-6 max-w-xs text-center animate-page-in'>
        {/* Pulsing Branded Logo Container */}
        <div className='relative flex items-center justify-center p-4 bg-bg-surface border border-border-main/80 rounded-2xl shadow-md'>
          {/* Subtle Ambient Glow Behind Logo */}
          <div className='absolute -inset-1 rounded-2xl bg-navy-500/20 blur-md animate-pulse dark:bg-navy-400/20' />

          <img
            src={logoSrc}
            alt={appName}
            className='h-20 w-auto relative z-10 transition-transform duration-300 hover:scale-105'
          />
        </div>

        {/* Loading Message */}
        <div className='space-y-1.5'>
          <h2 className='text-sm font-bold text-text-main tracking-tight'>
            {appName}
          </h2>
          <p className='text-xs text-text-muted font-medium animate-pulse'>
            {subtitle}
          </p>
        </div>

        {/* Custom Sleek Progress Bar Indicator */}
        <div className='w-36 h-1 bg-bg-surface border border-border-main/60 rounded-full overflow-hidden relative shadow-inner'>
          <div className='absolute inset-y-0 bg-navy-500 dark:bg-navy-400 rounded-full w-1/3 animate-[hydration-slide_1.4s_infinite_ease-in-out]' />
        </div>
      </div>
    </div>
  );
}
