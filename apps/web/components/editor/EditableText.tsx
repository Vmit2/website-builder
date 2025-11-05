'use client';

import { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import ContentEditable from 'react-contenteditable';
import { useEditorStore } from '@/lib/store/editor-store';

interface EditableTextProps {
  id: string;
  value: string;
  defaultValue?: string;
  onChange: (value: string) => void;
  className?: string;
  tag?: 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'span' | 'div' | 'button';
  placeholder?: string;
  disabled?: boolean;
  style?: React.CSSProperties;
}

export default function EditableText({
  id,
  value,
  defaultValue,
  onChange,
  className = '',
  tag = 'div',
  placeholder = 'Click to edit...',
  disabled = false,
  style,
}: EditableTextProps) {
  const { isEditMode } = useEditorStore();
  const [isFocused, setIsFocused] = useState(false);
  const [internalValue, setInternalValue] = useState(value || defaultValue || '');
  const editableRef = useRef<HTMLElement>(null);

  // Memoize displayValue to ensure it doesn't cause dependency array changes
  const displayValue = useMemo(() => value || defaultValue || '', [value, defaultValue]);

  // Track if we just saved to prevent immediate sync reset
  const justSavedRef = useRef(false);

  // Set button-specific attributes when tag is "button"
  useEffect(() => {
    if (tag === 'button' && editableRef.current) {
      const element = editableRef.current as HTMLButtonElement;
      if (element && !element.hasAttribute('type')) {
        element.setAttribute('type', 'button');
      }
    }
  }, [tag]);

  // Sync internal value with prop value when not focused
  // Only update if the prop value is truly different (not just a re-render)
  useEffect(() => {
    // Don't sync while user is actively editing or immediately after save
    if (isFocused || justSavedRef.current) {
      return;
    }
    
    // Only sync if the external value is meaningfully different
    // Compare as strings to handle HTML formatting correctly
    const currentValue = internalValue || '';
    const propValue = displayValue || '';
    
    // Only update if values are actually different
    // This prevents resetting user edits
    if (propValue !== currentValue && propValue !== '') {
      // Use a longer delay to allow blur handlers and saves to complete
      const timeoutId = setTimeout(() => {
        // Double-check we're still not focused
        // Use functional update to get latest state
        setInternalValue((latestInternal) => {
          // Only sync if prop value is still different
          if (propValue !== latestInternal && propValue !== '') {
            console.log('🔄 Syncing from prop:', { id, from: latestInternal, to: propValue });
            return propValue;
          }
          return latestInternal;
        });
      }, 300);
      
      return () => clearTimeout(timeoutId);
    }
    // Note: We intentionally omit internalValue from deps to prevent loops
    // The effect only needs to react to external prop changes
    // displayValue is memoized from value/defaultValue, so we use those directly
  }, [value, defaultValue, isFocused, displayValue, id]);

  const handleChange = useCallback((e: any) => {
    // react-contenteditable provides HTML content in e.target.value
    // Always use innerHTML to preserve all formatting (colors, bold, italic, links, etc.)
    const target = e.target;
    // Use innerHTML to get the actual HTML with all formatting
    const newValue = target.innerHTML || target.value || '';
    
    console.log('📝 EditableText onChange:', { 
      id, 
      newValue, 
      editMode: isEditMode,
      htmlLength: newValue.length 
    });
    
    if (isEditMode && !disabled) {
      // Mark as just saved to prevent sync reset
      justSavedRef.current = true;
      
      // Update internal value immediately to reflect what user is typing/formatting
      // This includes any formatting applied by FloatingToolbar (colors, bold, etc.)
      setInternalValue(newValue);
      
      // Also update parent/store immediately so changes are tracked
      onChange(newValue);
      
      // Reset flag after a delay (clear any pending timeout first)
      setTimeout(() => {
        justSavedRef.current = false;
      }, 150);
    }
  }, [id, onChange, isEditMode, disabled]);

  // Listen for input events to capture formatting changes (like colors) that don't trigger onChange
  useEffect(() => {
    if (!editableRef.current || !isEditMode || disabled) return;

    const element = editableRef.current;
    
    // Listen for input events (includes paste, formatting changes, etc.)
    const handleInput = (e: Event) => {
      const target = e.target as HTMLElement;
      const htmlValue = target.innerHTML || '';
      
      if (htmlValue !== internalValue) {
        console.log('🎨 Input event detected (formatting change):', { id, htmlValue });
        // Mark as just saved to prevent sync reset
        justSavedRef.current = true;
        setInternalValue(htmlValue);
        onChange(htmlValue);
        // Reset flag after a delay
        setTimeout(() => {
          justSavedRef.current = false;
        }, 200);
      }
    };

    // Also listen for selection changes that might indicate formatting
    const handleSelectionChange = () => {
      // Small delay to let formatting apply
      setTimeout(() => {
        if (element && document.activeElement === element) {
          const htmlValue = element.innerHTML || '';
          if (htmlValue !== internalValue && htmlValue.length > 0) {
            console.log('🎨 Selection change (formatting applied):', { id, htmlValue });
            // Mark as just saved to prevent sync reset
            justSavedRef.current = true;
            setInternalValue(htmlValue);
            onChange(htmlValue);
            // Reset flag after a delay
            setTimeout(() => {
              justSavedRef.current = false;
            }, 200);
          }
        }
      }, 50);
    };

    element.addEventListener('input', handleInput);
    document.addEventListener('selectionchange', handleSelectionChange);

    return () => {
      element.removeEventListener('input', handleInput);
      document.removeEventListener('selectionchange', handleSelectionChange);
    };
  }, [id, isEditMode, disabled, internalValue, onChange]);

  const handleFocus = useCallback(() => {
    console.log('🎯 EditableText focus:', { id, isEditMode, disabled });
    if (isEditMode && !disabled) {
      setIsFocused(true);
    }
  }, [id, isEditMode, disabled]);

  const handleBlur = useCallback(() => {
    console.log('👋 EditableText blur:', { id, internalValue, displayValue });
    
    // Mark that we're saving to prevent sync from resetting
    justSavedRef.current = true;
    
    // On blur, capture the final HTML content (preserving all formatting including colors)
    if (editableRef.current) {
      // Use innerHTML to preserve all HTML formatting (colors, bold, italic, etc.)
      const finalValue = editableRef.current.innerHTML || '';
      console.log('💾 Saving on blur:', { id, finalValue, oldInternal: internalValue });
      
      // Always update internal state and parent/store with the final value
      // Don't check if different - the DOM is the source of truth
      setInternalValue(finalValue);
      onChange(finalValue);
    }
    
    // Small delay before setting focused to false to allow save to complete
    setTimeout(() => {
      setIsFocused(false);
      // Keep the flag for a bit longer to prevent immediate sync
      setTimeout(() => {
        justSavedRef.current = false;
      }, 200);
    }, 100);
  }, [id, onChange, internalValue, displayValue]);

  const handleClick = useCallback((e: React.MouseEvent) => {
    if (!isEditMode || disabled) {
      console.log('🚫 EditableText click blocked:', { id, isEditMode, disabled });
      // Don't prevent default - let the click through to show user they need to enable edit mode
    } else {
      console.log('✅ EditableText click allowed:', { id, isEditMode });
    }
  }, [id, isEditMode, disabled]);

  const isEditable = isEditMode && !disabled;

  // Update contentEditable attribute directly on the DOM element
  useEffect(() => {
    if (editableRef.current) {
      const shouldBeEditable = isEditable ? 'true' : 'false';
      if (editableRef.current.contentEditable !== shouldBeEditable) {
        editableRef.current.contentEditable = shouldBeEditable;
        console.log('🔧 Set contentEditable:', { id, isEditable, actual: editableRef.current.contentEditable });
      }
    }
  }, [id, isEditable]);

  // Sync innerHTML with internal value only when not focused
  // Separate effect to avoid interfering with contentEditable updates
  useEffect(() => {
    if (editableRef.current && !isFocused) {
      const currentHtml = editableRef.current.innerHTML || '';
      // Only update if different to avoid unnecessary DOM manipulation
      // This preserves formatting like colors, bold, italic, etc.
      if (currentHtml !== internalValue && internalValue !== undefined && internalValue !== null) {
        editableRef.current.innerHTML = internalValue || '';
      }
    }
  }, [isFocused, internalValue]);

  return (
    <div 
      className="relative group"
      onClick={handleClick}
      style={{ position: 'relative' }}
    >
      <ContentEditable
        innerRef={editableRef}
        html={internalValue || ''}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        contentEditable={isEditable}
        className={`
          ${className}
          ${isEditable ? 'cursor-text select-text' : 'cursor-default select-none'}
          ${isEditable && isFocused ? 'outline-dashed outline-2 outline-offset-2 outline-blue-400 ring-2 ring-blue-300' : ''}
          ${isEditable && !isFocused ? 'hover:outline-dashed hover:outline-2 hover:outline-2 hover:outline-offset-2 hover:outline-pink-400' : ''}
          ${!internalValue && isEditMode ? 'text-gray-400 italic' : ''}
          transition-all duration-150
          min-h-[1.5em]
          ${!isEditable ? 'pointer-events-none' : ''}
        `}
        tagName={tag}
        data-placeholder={!internalValue && isEditMode ? placeholder : ''}
        data-section-id={id}
        suppressContentEditableWarning={true}
        style={{
          // Don't override inline styles - let HTML formatting (colors, etc.) show through
          // The HTML content itself contains the formatting applied by FloatingToolbar
          ...style,
        }}
      />
      {!internalValue && isEditMode && !isFocused && (
        <span 
          className="absolute inset-0 text-gray-400 italic opacity-50 pointer-events-none"
          style={{ 
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0,
            zIndex: -1
          }}
        >
          {placeholder}
        </span>
      )}
      {isEditable && (
        <div className="absolute -top-6 left-0 text-xs text-blue-600 dark:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
          Click to edit
        </div>
      )}
    </div>
  );
}
