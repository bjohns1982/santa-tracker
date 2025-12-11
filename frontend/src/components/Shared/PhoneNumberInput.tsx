import { useState, useEffect } from 'react';

interface PhoneNumberInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  label?: string;
  error?: string;
}

export default function PhoneNumberInput({
  value,
  onChange,
  placeholder = '+1 (XXX) XXX-XXXX',
  required = false,
  label,
  error,
}: PhoneNumberInputProps) {
  const [displayValue, setDisplayValue] = useState('');

  useEffect(() => {
    // Format initial value for display
    if (value) {
      setDisplayValue(formatPhoneForDisplay(value));
    } else {
      setDisplayValue('');
    }
  }, [value]);

  const formatPhoneForDisplay = (phone: string): string => {
    // Remove all non-digits
    const digits = phone.replace(/\D/g, '');
    
    // Remove leading 1 if present
    const cleaned = digits.startsWith('1') ? digits.slice(1) : digits;
    
    if (cleaned.length === 0) return '';
    if (cleaned.length <= 3) return `+1 (${cleaned}`;
    if (cleaned.length <= 6) return `+1 (${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`;
    return `+1 (${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    
    // Remove all non-digits and the +1 prefix if user types it
    let digits = input.replace(/\D/g, '');
    
    // Remove leading 1 if present (we'll add +1)
    if (digits.startsWith('1')) {
      digits = digits.slice(1);
    }
    
    // Limit to 10 digits
    digits = digits.slice(0, 10);
    
    // Format for display
    const formatted = formatPhoneForDisplay(digits);
    setDisplayValue(formatted);
    
    // Store as +1XXXXXXXXXX format
    if (digits.length === 10) {
      onChange(`+1${digits}`);
    } else {
      onChange('');
    }
  };

  const validatePhone = (phone: string): boolean => {
    if (!phone) return !required;
    const digits = phone.replace(/\D/g, '');
    return digits.length === 11 && phone.startsWith('+1');
  };

  const isValid = !value || validatePhone(value);

  return (
    <div>
      {label && (
        <label className="block text-gray-700 font-semibold mb-2 text-sm">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <input
        type="tel"
        value={displayValue}
        onChange={handleChange}
        placeholder={placeholder}
        required={required}
        className={`input-field ${error || (!isValid && value) ? 'border-red-500' : ''}`}
      />
      {error && (
        <p className="text-xs text-red-600 mt-1">{error}</p>
      )}
      {!error && !isValid && value && (
        <p className="text-xs text-red-600 mt-1">Please enter a valid 10-digit phone number</p>
      )}
    </div>
  );
}

