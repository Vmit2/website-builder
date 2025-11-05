'use client';

import { useState, useEffect, useRef } from 'react';
import { useEditorStore } from '@/lib/store/editor-store';
import { Bold, Italic, Link, Type, Palette, Undo, Redo, Save, X } from 'lucide-react';

interface FloatingToolbarProps {
  onSave?: () => void;
  onExit?: () => void;
  selection?: Selection | null;
}

export default function FloatingToolbar({ onSave, onExit }: FloatingToolbarProps) {
  const { isEditMode, isSaving, hasUnsavedChanges } = useEditorStore();
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const toolbarRef = useRef<HTMLDivElement>(null);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [showFontSizePicker, setShowFontSizePicker] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  // Store the last valid selection range when toolbar appears
  const savedSelectionRef = useRef<Range | null>(null);
  // Track active formatting states
  const [activeFormatting, setActiveFormatting] = useState({
    bold: false,
    italic: false,
    link: false,
    fontSize: null as string | null,
    color: null as string | null,
  });

  const colors = [
    '#000000', '#333333', '#666666', '#999999', '#CCCCCC',
    '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF',
    '#00FFFF', '#FFA500', '#800080', '#FFC0CB', '#A52A2A',
  ];

  useEffect(() => {
    if (!isEditMode) {
      setIsVisible(false);
      return;
    }

            const handleSelectionChange = () => {
      const selection = window.getSelection();
      if (selection && selection.toString().length > 0 && isEditMode) {
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        
        // Save the selection range for later use (when buttons are clicked)
        savedSelectionRef.current = range.cloneRange();
        
        // Check formatting state of current selection immediately
        // Use a small timeout to ensure DOM is ready
        setTimeout(() => {
          checkFormattingState();
        }, 10);
        
        // Calculate toolbar position (centered above selection)
        let left = rect.left + rect.width / 2;
        let top = rect.top - 60;
        
        // Clamp to viewport bounds
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const toolbarWidth = 400; // Approximate max toolbar width
        const toolbarHeight = 60;
        
        // Ensure toolbar doesn't go off the left or right edge
        if (left - toolbarWidth / 2 < 10) {
          left = toolbarWidth / 2 + 10;
        } else if (left + toolbarWidth / 2 > viewportWidth - 10) {
          left = viewportWidth - toolbarWidth / 2 - 10;
        }
        
        // Ensure toolbar doesn't go off the top edge
        if (top < 10) {
          top = rect.bottom + 10; // Show below selection instead
        }
        
        // Ensure toolbar doesn't go off the bottom edge
        if (top + toolbarHeight > viewportHeight - 10) {
          top = rect.top - toolbarHeight - 10;
          // If still off screen, position above viewport (will scroll into view)
          if (top < 10) {
            top = 10;
          }
        }

        setPosition({ top, left });
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    const handleMouseUp = () => {
      setTimeout(handleSelectionChange, 10);
    };

    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('selectionchange', handleSelectionChange);

    return () => {
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('selectionchange', handleSelectionChange);
    };
  }, [isEditMode]);

  // Helper to check current formatting state of selection
  const checkFormattingState = () => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0 || selection.toString().length === 0) {
      // Reset state if no selection
      setActiveFormatting({
        bold: false,
        italic: false,
        link: false,
        fontSize: null,
        color: null,
      });
      return;
    }

    // Restore selection first to ensure queryCommandState works
    const range = selection.getRangeAt(0);
    
    // Find the contenteditable element and focus it
    let editableElement: HTMLElement | null = null;
    let node = range.commonAncestorContainer;
    if (node.nodeType === Node.TEXT_NODE) {
      node = node.parentElement as HTMLElement;
    }
    while (node && node !== document.body) {
      if ((node as HTMLElement).contentEditable === 'true') {
        editableElement = node as HTMLElement;
        break;
      }
      node = (node as HTMLElement).parentElement as HTMLElement;
    }

    if (editableElement) {
      editableElement.focus();
      // Ensure selection is active
      const sel = window.getSelection();
      if (sel) {
        sel.removeAllRanges();
        sel.addRange(range);
      }
    }
    
    // Initialize state
    // Use queryCommandState for more reliable detection of bold/italic
    const state = {
      bold: document.queryCommandState('bold'),
      italic: document.queryCommandState('italic'),
      link: false,
      fontSize: null as string | null,
      color: null as string | null,
    };

    // Check the start and end nodes of the selection for link, font size, and color
    const startNode = range.startContainer;
    const endNode = range.endContainer;
    
    // Function to check a node and its parents
    const checkNode = (node: Node) => {
      let currentNode: Node | null = node.nodeType === Node.TEXT_NODE 
        ? node.parentElement 
        : node;
      
      while (currentNode && currentNode !== document.body) {
        if (currentNode.nodeType === Node.ELEMENT_NODE) {
          const element = currentNode as HTMLElement;
          const tagName = element.tagName?.toLowerCase();
          const style = window.getComputedStyle(element);

          // Check for link
          if (!state.link && tagName === 'a' && element.hasAttribute('href')) {
            state.link = true;
          }

          // Check for font size (font tag with size attribute)
          if (!state.fontSize && tagName === 'font' && element.hasAttribute('size')) {
            state.fontSize = element.getAttribute('size');
          } else if (!state.fontSize) {
            // Check inline style for font-size
            const fontSizeMatch = style.fontSize?.match(/(\d+)px/);
            if (fontSizeMatch) {
              const sizeInPx = parseInt(fontSizeMatch[1]);
              // Convert px to font size scale (rough approximation)
              if (sizeInPx <= 10) state.fontSize = '1';
              else if (sizeInPx <= 12) state.fontSize = '2';
              else if (sizeInPx <= 14) state.fontSize = '3';
              else if (sizeInPx <= 18) state.fontSize = '4';
              else if (sizeInPx <= 24) state.fontSize = '5';
              else if (sizeInPx <= 36) state.fontSize = '6';
              else state.fontSize = '7';
            }
          }

          // Check for color (font tag with color attribute or inline style)
          if (!state.color && tagName === 'font' && element.hasAttribute('color')) {
            state.color = element.getAttribute('color');
          } else if (!state.color && style.color) {
            const colorValue = style.color;
            // Skip default black colors
            if (colorValue !== 'rgb(0, 0, 0)' && colorValue !== '#000000' && 
                colorValue !== 'rgb(0, 0, 0)' && !colorValue.match(/rgba?\(0,\s*0,\s*0/)) {
              // Convert RGB/RGBA to hex
              const rgbMatch = colorValue.match(/\d+/g);
              if (rgbMatch && rgbMatch.length >= 3) {
                const r = parseInt(rgbMatch[0]).toString(16).padStart(2, '0');
                const g = parseInt(rgbMatch[1]).toString(16).padStart(2, '0');
                const b = parseInt(rgbMatch[2]).toString(16).padStart(2, '0');
                state.color = `#${r}${g}${b}`;
              } else if (colorValue.startsWith('#')) {
                state.color = colorValue;
              }
            }
          }
        }
        currentNode = currentNode.parentElement;
      }
    };

    // Check both start and end nodes
    checkNode(startNode);
    checkNode(endNode);

    setActiveFormatting(state);
  };

  // Helper to trigger input event on active contenteditable element
  const triggerInputEvent = () => {
    // Find the active contenteditable element
    let activeElement = document.activeElement as HTMLElement;
    
    // If active element is not contenteditable, find the nearest one
    if (!activeElement || activeElement.contentEditable !== 'true') {
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        let node = selection.getRangeAt(0).commonAncestorContainer;
        if (node.nodeType === Node.TEXT_NODE) {
          node = node.parentElement as HTMLElement;
        }
        while (node && node !== document.body) {
          if ((node as HTMLElement).contentEditable === 'true') {
            activeElement = node as HTMLElement;
            break;
          }
          node = (node as HTMLElement).parentElement as HTMLElement;
        }
      }
    }
    
    if (activeElement && activeElement.contentEditable === 'true') {
      // Create and dispatch an input event to trigger onChange
      const inputEvent = new Event('input', { bubbles: true, cancelable: true });
      activeElement.dispatchEvent(inputEvent);
      
      // Also try triggering a change event for good measure
      const changeEvent = new Event('change', { bubbles: true, cancelable: true });
      activeElement.dispatchEvent(changeEvent);
    }
  };

  const execCommand = (command: string, value?: string, preserveSelection = false) => {
    // First, try to restore the saved selection if current selection is empty
    let selection = window.getSelection();
    let range: Range | null = null;
    let selectedText = '';
    
    if (selection && selection.rangeCount > 0 && selection.toString().length > 0) {
      // Current selection is valid, use it
      range = selection.getRangeAt(0).cloneRange();
      selectedText = selection.toString();
    } else if (savedSelectionRef.current) {
      // Restore the saved selection
      range = savedSelectionRef.current.cloneRange();
      selectedText = range.toString();
      
      // Restore the selection in the DOM
      if (selection) {
        selection.removeAllRanges();
        selection.addRange(range);
      }
    }
    
    if (!range || !selectedText) {
      console.warn('No selection available for command:', command);
      return;
    }

    // Find and focus the contenteditable element
    let editableElement: HTMLElement | null = null;
    let node = range.commonAncestorContainer;
    if (node.nodeType === Node.TEXT_NODE) {
      node = node.parentElement as HTMLElement;
    }
    while (node && node !== document.body) {
      if ((node as HTMLElement).contentEditable === 'true') {
        editableElement = node as HTMLElement;
        break;
      }
      node = (node as HTMLElement).parentElement as HTMLElement;
    }

    if (!editableElement) {
      console.warn('No contenteditable element found');
      return;
    }

    // Focus the element to ensure commands work
    editableElement.focus();

    // Get fresh selection and restore the range
    selection = window.getSelection();
    if (selection) {
      selection.removeAllRanges();
      selection.addRange(range);
    }
    
    // Apply the command (execCommand naturally toggles bold/italic on/off)
    const success = document.execCommand(command, false, value);
    
    if (!success) {
      console.warn('execCommand failed:', command, value);
    }
    
    // Restore selection after command (for further formatting)
    if (preserveSelection && success) {
      // Wait for DOM to update, then try to restore selection
      setTimeout(() => {
        try {
          const newSelection = window.getSelection();
          if (!newSelection) return;
          
          // Try to find the formatted element and select it
          const container = range.commonAncestorContainer;
          let targetElement: HTMLElement | null = null;
          
          if (container.nodeType === Node.TEXT_NODE) {
            targetElement = (container as Text).parentElement;
          } else {
            targetElement = container as HTMLElement;
          }
          
          // Walk up to find the formatted wrapper (b, i, u, font, span with style)
          while (targetElement && targetElement !== editableElement) {
            const tagName = targetElement.tagName?.toLowerCase();
            if (['b', 'i', 'u', 'strong', 'em', 'font', 'span'].includes(tagName)) {
              // Found a formatting element, try to select its contents
              const newRange = document.createRange();
              if (targetElement.firstChild) {
                newRange.setStartBefore(targetElement.firstChild);
                newRange.setEndAfter(targetElement.lastChild || targetElement.firstChild);
              } else {
                newRange.selectNodeContents(targetElement);
              }
              newSelection.removeAllRanges();
              newSelection.addRange(newRange);
              return;
            }
            targetElement = targetElement.parentElement;
          }
          
          // Fallback: try to re-select the same text by searching for it
          const textToFind = selectedText.trim();
          if (textToFind && editableElement) {
            const textContent = editableElement.textContent || '';
            const index = textContent.indexOf(textToFind);
            if (index >= 0) {
              // Use a tree walker to find the exact text nodes
              const walker = document.createTreeWalker(
                editableElement,
                NodeFilter.SHOW_TEXT,
                null
              );
              
              let node;
              let charCount = 0;
              let startNode: Text | null = null;
              let endNode: Text | null = null;
              let startOffset = 0;
              let endOffset = 0;
              
              while ((node = walker.nextNode())) {
                const textNode = node as Text;
                const nodeLength = textNode.textContent?.length || 0;
                
                if (!startNode && charCount <= index && index < charCount + nodeLength) {
                  startNode = textNode;
                  startOffset = index - charCount;
                }
                
                if (startNode && charCount <= index + textToFind.length && index + textToFind.length <= charCount + nodeLength) {
                  endNode = textNode;
                  endOffset = index + textToFind.length - charCount;
                  break;
                }
                
                charCount += nodeLength;
              }
              
              if (startNode && endNode) {
                const newRange = document.createRange();
                newRange.setStart(startNode, Math.max(0, startOffset));
                newRange.setEnd(endNode, Math.min(endNode.textContent?.length || 0, endOffset));
                newSelection.removeAllRanges();
                newSelection.addRange(newRange);
              }
            }
          }
        } catch (e) {
          console.warn('Could not restore selection:', e);
        }
      }, 50);
    }
    
    // Always trigger input event to ensure onChange fires in EditableText
    // Use a delay to ensure the DOM has been fully updated
    setTimeout(() => {
      triggerInputEvent();
      
      // Re-check formatting state after applying command
      if (preserveSelection) {
        // Small delay to ensure DOM is updated
        setTimeout(() => {
          checkFormattingState();
        }, 10);
        
        // Update toolbar position after formatting
        const newSelection = window.getSelection();
        if (newSelection && newSelection.rangeCount > 0) {
          const newRange = newSelection.getRangeAt(0);
          const rect = newRange.getBoundingClientRect();
          
          // Use the same viewport clamping logic
          let left = rect.left + rect.width / 2;
          let top = rect.top - 60;
          const viewportWidth = window.innerWidth;
          const toolbarWidth = 400;
          
          if (left - toolbarWidth / 2 < 10) {
            left = toolbarWidth / 2 + 10;
          } else if (left + toolbarWidth / 2 > viewportWidth - 10) {
            left = viewportWidth - toolbarWidth / 2 - 10;
          }
          
          if (top < 10) {
            top = rect.bottom + 10;
          }
          
          setPosition({ top, left });
        }
      }
    }, 50);
    
    // Clear selection and hide toolbar if not preserving selection
    if (!preserveSelection) {
      setTimeout(() => {
        window.getSelection()?.removeAllRanges();
        setIsVisible(false);
      }, 150);
    }
  };

  const handleLink = () => {
    // If link already exists and we're not showing input, remove it
    if (activeFormatting.link && !showLinkInput) {
      // Restore selection first
      const selection = window.getSelection();
      if (savedSelectionRef.current && selection) {
        selection.removeAllRanges();
        selection.addRange(savedSelectionRef.current);
      }
      // Remove link by unlink command
      document.execCommand('unlink', false);
      triggerInputEvent();
      checkFormattingState();
      return;
    }
    
    // If showing input, create/update link
    if (showLinkInput) {
      if (linkUrl) {
        execCommand('createLink', linkUrl, true);
      }
      setShowLinkInput(false);
      setLinkUrl('');
    } else {
      // Show input to add new link
      setShowLinkInput(true);
    }
  };

  const handleFontSizeSelect = (size: string) => {
    // fontSize command uses 1-7 scale (1=smallest, 7=largest)
    // Use execCommand which will trigger input event automatically
    execCommand('fontSize', size, true);
    setShowFontSizePicker(false);
  };

  const handleColorSelect = (color: string) => {
    // Restore selection before applying color
    const selection = window.getSelection();
    if (savedSelectionRef.current) {
      if (selection) {
        selection.removeAllRanges();
        selection.addRange(savedSelectionRef.current);
      }
    }
    
    // Use execCommand with preserveSelection to keep selection active
    execCommand('foreColor', color, true);
    setShowColorPicker(false);
  };

  if (!isEditMode || !isVisible) return null;

  return (
    <>
      <div
        ref={toolbarRef}
        className="fixed z-[100] bg-gray-900 text-white rounded-lg shadow-xl p-2 flex items-center gap-1"
        style={{
          top: `${position.top}px`,
          left: `${position.left}px`,
          transform: 'translateX(-50%)',
        }}
        onMouseDown={(e) => {
          // Prevent clicks on toolbar from clearing selection
          e.preventDefault();
          e.stopPropagation();
        }}
        onClick={(e) => {
          // Prevent clicks from propagating and causing blur
          e.stopPropagation();
        }}
      >
        {/* Bold */}
        <button
          onMouseDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
            // Restore selection before clicking
            const selection = window.getSelection();
            if (savedSelectionRef.current && selection) {
              selection.removeAllRanges();
              selection.addRange(savedSelectionRef.current);
            }
          }}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            execCommand('bold', undefined, true);
          }}
          className={`p-2 rounded transition-colors ${
            activeFormatting.bold 
              ? 'bg-blue-600 hover:bg-blue-700' 
              : 'hover:bg-gray-700'
          }`}
          title="Bold (Ctrl+B)"
        >
          <Bold className="w-4 h-4" />
        </button>

        {/* Italic */}
        <button
          onMouseDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
            // Restore selection before clicking
            const selection = window.getSelection();
            if (savedSelectionRef.current && selection) {
              selection.removeAllRanges();
              selection.addRange(savedSelectionRef.current);
            }
          }}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            execCommand('italic', undefined, true);
          }}
          className={`p-2 rounded transition-colors ${
            activeFormatting.italic 
              ? 'bg-blue-600 hover:bg-blue-700' 
              : 'hover:bg-gray-700'
          }`}
          title="Italic (Ctrl+I)"
        >
          <Italic className="w-4 h-4" />
        </button>

        {/* Link */}
        <div className="relative">
          <button
            onMouseDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleLink();
            }}
            className={`p-2 rounded transition-colors ${
              activeFormatting.link 
                ? 'bg-blue-600 hover:bg-blue-700' 
                : 'hover:bg-gray-700'
            }`}
            title={activeFormatting.link ? "Remove Link" : "Add Link"}
          >
            <Link className="w-4 h-4" />
          </button>
          {showLinkInput && (
            <div className="absolute top-full mt-2 left-0 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3 z-50 min-w-[300px]">
              <input
                type="url"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="Enter URL"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleLink();
                  }
                  if (e.key === 'Escape') {
                    setShowLinkInput(false);
                    setLinkUrl('');
                  }
                }}
                autoFocus
              />
              <div className="flex gap-2 mt-2">
                <button
                  onClick={handleLink}
                  className="flex-1 px-3 py-1 bg-blue-600 text-white rounded text-sm"
                >
                  Add
                </button>
                <button
                  onClick={() => {
                    setShowLinkInput(false);
                    setLinkUrl('');
                  }}
                  className="flex-1 px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="w-px h-6 bg-gray-600 mx-1" />

        {/* Font Size Dropdown */}
        <div className="relative">
          <button
            onMouseDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
              // Restore selection before opening dropdown
              const selection = window.getSelection();
              if (savedSelectionRef.current && selection) {
                selection.removeAllRanges();
                selection.addRange(savedSelectionRef.current);
              }
            }}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowFontSizePicker(!showFontSizePicker);
            }}
            className={`p-2 rounded transition-colors flex items-center gap-1 ${
              activeFormatting.fontSize && activeFormatting.fontSize !== '3'
                ? 'bg-blue-600 hover:bg-blue-700' 
                : 'hover:bg-gray-700'
            }`}
            title={`Font Size${activeFormatting.fontSize ? ` (Current: ${activeFormatting.fontSize})` : ''}`}
          >
            <Type className="w-4 h-4" />
            <span className="text-xs">{activeFormatting.fontSize || '3'}</span>
          </button>
          {showFontSizePicker && (
            <div className="absolute top-full mt-2 left-0 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-2 z-50 min-w-[120px]">
              {[
                { value: '1', label: 'Smallest' },
                { value: '2', label: 'Small' },
                { value: '3', label: 'Normal' },
                { value: '4', label: 'Large' },
                { value: '5', label: 'X-Large' },
                { value: '6', label: 'XX-Large' },
                { value: '7', label: 'XXX-Large' },
              ].map((size) => (
                <button
                  key={size.value}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    // Restore selection before applying font size
                    const selection = window.getSelection();
                    if (savedSelectionRef.current && selection) {
                      selection.removeAllRanges();
                      selection.addRange(savedSelectionRef.current);
                    }
                  }}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleFontSizeSelect(size.value);
                  }}
                  className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                    activeFormatting.fontSize === size.value
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-900 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  {size.label} ({size.value})
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Color */}
        <div className="relative">
          <button
            onMouseDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowColorPicker(!showColorPicker);
            }}
            className={`p-2 rounded transition-colors ${
              activeFormatting.color 
                ? 'bg-blue-600 hover:bg-blue-700' 
                : 'hover:bg-gray-700'
            }`}
            title={`Text Color${activeFormatting.color ? ` (${activeFormatting.color})` : ''}`}
          >
            <Palette className="w-4 h-4" />
            {activeFormatting.color && (
              <span 
                className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-3 h-0.5 rounded"
                style={{ backgroundColor: activeFormatting.color }}
              />
            )}
          </button>
          {showColorPicker && (
            <div className="absolute top-full mt-2 left-0 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3 z-50 w-64">
              <div className="grid grid-cols-5 gap-2">
                {colors.map((color) => (
                  <button
                    key={color}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleColorSelect(color);
                    }}
                    className="w-8 h-8 rounded border-2 border-gray-300 dark:border-gray-600 hover:scale-110 transition-transform"
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="w-px h-6 bg-gray-600 mx-1" />

        {/* Undo */}
        <button
          onMouseDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            document.execCommand('undo', false);
            triggerInputEvent();
          }}
          className="p-2 hover:bg-gray-700 rounded transition-colors"
          title="Undo"
        >
          <Undo className="w-4 h-4" />
        </button>

        {/* Redo */}
        <button
          onMouseDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            document.execCommand('redo', false);
            triggerInputEvent();
          }}
          className="p-2 hover:bg-gray-700 rounded transition-colors"
          title="Redo"
        >
          <Redo className="w-4 h-4" />
        </button>

        <div className="w-px h-6 bg-gray-600 mx-1" />

        {/* Save */}
        <button
          onClick={onSave}
          disabled={isSaving || !hasUnsavedChanges}
          className="p-2 hover:bg-gray-700 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
          title="Save (Ctrl+S)"
        >
          <Save className="w-4 h-4" />
          {isSaving && <span className="text-xs">Saving...</span>}
        </button>

        {/* Exit Edit Mode */}
        {onExit && (
          <button
            onClick={onExit}
            className="p-2 hover:bg-gray-700 rounded transition-colors"
            title="Exit Edit Mode"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Click outside to close color picker, font size picker, and link input */}
      {(showColorPicker || showFontSizePicker || showLinkInput) && (
        <div
          className="fixed inset-0 z-[90]"
          onClick={() => {
            setShowColorPicker(false);
            setShowFontSizePicker(false);
            setShowLinkInput(false);
            setLinkUrl('');
          }}
        />
      )}
    </>
  );
}
