import { InputHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, ...props }, ref) => {
    return (
      <div className="flex items-center">
        <input
          ref={ref}
          type="checkbox"
          className={cn(
            'h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500',
            className
          )}
          {...props}
        />
        {label && (
          <label className="ml-2 text-sm text-gray-700">
            {label}
          </label>
        )}
      </div>
    )
  }
)

Checkbox.displayName = 'Checkbox'

export default Checkbox
