import { InputHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, type, onKeyDown, ...props }, ref) => {
    // Prevent negative numbers for number inputs
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (type === 'number') {
        // Prevent minus sign, plus sign, and 'e' (scientific notation)
        if (e.key === '-' || e.key === '+' || e.key === 'e' || e.key === 'E') {
          e.preventDefault()
        }
      }
      // Call original onKeyDown if provided
      if (onKeyDown) {
        onKeyDown(e)
      }
    }

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {label}
          </label>
        )}
        <input
          ref={ref}
          type={type}
          className={cn(
            'w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors bg-white text-gray-900',
            error ? 'border-red-500' : 'border-gray-300',
            className
          )}
          onKeyDown={handleKeyDown}
          {...props}
        />
        {error && (
          <p className="mt-1 text-sm text-red-600">{error}</p>
        )}
        {helperText && !error && (
          <p className="mt-1 text-sm text-gray-500">{helperText}</p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

export default Input
