import { useState, useRef, useEffect } from 'react';
import { LogOut, User, Settings, Check, X } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';

export function ProfileMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Hypothetical auth retrieval from your existing state hook
  const { admin, logout } = useAuthStore();
  const [displayName, setDisplayName] = useState(admin?.name || 'ICORE ADMIN');
  const [email, setEmail] = useState(admin?.email || 'nesh@neshltd.com');

  // Handle clicks outside to dismiss dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    // Save logic can hook into your existing update API
    setIsEditing(false);
    setIsOpen(false);
  };

  return (
    <div className='relative' ref={dropdownRef}>
      {/* Profile Ellipse Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className='flex items-center gap-2 p-1.5 rounded-full border border-border-main bg-bg-surface hover:bg-bg-surface-hover transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-navy-500/20 cursor-pointer'
        aria-expanded={isOpen}
        aria-haspopup='true'>
        <div className='h-8 w-8 rounded-full bg-navy-500 text-white flex items-center justify-center font-bold text-xs shadow-xs'>
          {displayName
            .split(' ')
            .map((n) => n[0])
            .join('')
            .slice(0, 2)
            .toUpperCase()}
        </div>
        <span className='hidden md:inline text-xs font-semibold pr-2 text-text-main'>
          {displayName}
        </span>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className='absolute right-0 mt-2 w-64 rounded-xl border border-border-main bg-bg-surface shadow-lg py-1 z-50 animate-theme-fade'>
          <div className='px-4 py-3 border-b border-border-main'>
            <p className='text-xs font-semibold text-text-muted uppercase tracking-wider'>
              Signed in as
            </p>
            <p className='text-sm font-bold text-text-main truncate mt-0.5'>
              {displayName}
            </p>
            <p className='text-xs text-text-muted truncate'>{email}</p>
          </div>

          <div className='py-1'>
            <button
              onClick={() => {
                setIsEditing(true);
                setIsOpen(false);
              }}
              className='w-full text-left px-4 py-2 text-xs font-medium text-text-main hover:bg-bg-surface-hover flex items-center gap-2 transition-colors cursor-pointer'>
              <User className='h-4 w-4 text-text-muted' />
              Edit Profile Info
            </button>
            <button className='w-full text-left px-4 py-2 text-xs font-medium text-text-main hover:bg-bg-surface-hover flex items-center gap-2 transition-colors cursor-pointer'>
              <Settings className='h-4 w-4 text-text-muted' />
              Settings
            </button>
          </div>

          <div className='border-t border-border-main py-1'>
            <button
              onClick={() => logout()}
              className='w-full text-left px-4 py-2 text-xs font-semibold text-error-500 hover:bg-error-500/5 flex items-center gap-2 transition-colors cursor-pointer'>
              <LogOut className='h-4 w-4' />
              Sign Out
            </button>
          </div>
        </div>
      )}

      {/* Edit Profile Modal */}
      {isEditing && (
        <div className='fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4'>
          <div className='bg-bg-surface w-full max-w-md rounded-2xl border border-border-main p-6 shadow-xl relative animate-theme-fade'>
            <button
              onClick={() => setIsEditing(false)}
              className='absolute top-4 right-4 p-1.5 rounded-lg text-text-muted hover:bg-bg-surface-hover hover:text-text-main transition-colors'>
              <X className='h-4 w-4' />
            </button>
            <h3 className='text-lg font-bold text-text-main mb-1'>
              Edit Profile Details
            </h3>
            <p className='text-xs text-text-muted mb-4'>
              Keep your admin dashboard credential metadata clean and up to
              date.
            </p>

            <form onSubmit={handleSaveProfile} className='space-y-4'>
              <div>
                <label className='block text-xs font-bold uppercase tracking-wider text-text-muted mb-1'>
                  Display Name
                </label>
                <input
                  type='text'
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className='w-full px-3 py-2 text-sm bg-bg-base border border-border-main rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-500/30 text-text-main'
                  required
                />
              </div>
              <div>
                <label className='block text-xs font-bold uppercase tracking-wider text-text-muted mb-1'>
                  Email Address
                </label>
                <input
                  type='email'
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className='w-full px-3 py-2 text-sm bg-bg-base border border-border-main rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-500/30 text-text-main'
                  required
                />
              </div>
              <div className='flex gap-2 justify-end pt-2'>
                <button
                  type='button'
                  onClick={() => setIsEditing(false)}
                  className='px-4 py-2 text-xs font-bold text-text-muted hover:bg-bg-surface-hover rounded-lg transition-colors cursor-pointer'>
                  Cancel
                </button>
                <button
                  type='submit'
                  className='px-4 py-2 text-xs font-bold bg-navy-500 hover:bg-navy-600 text-white rounded-lg transition-colors flex items-center gap-1 cursor-pointer'>
                  <Check className='h-3.5 w-3.5' />
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
