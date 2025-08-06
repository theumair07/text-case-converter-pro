/**
 * Minimal Text Editor with Glassmorphism
 * Clean, utility-focused text transformation tool
 */

class TextEditor {
  constructor() {
    this.textEditor = null;
    this.feedbackMessage = null;
    this.activeFormats = new Set();
    
    this.init();
  }

  /**
   * Initialize the application
   */
  init() {
    this.bindElements();
    this.bindEvents();
    this.setupKeyboardShortcuts();
  }

  /**
   * Bind DOM elements
   */
  bindElements() {
    this.textEditor = document.getElementById('textEditor');
    this.feedbackMessage = document.getElementById('feedbackMessage');
  }

  /**
   * Bind event listeners
   */
  bindEvents() {
    // Text editor events
    if (this.textEditor) {
      this.textEditor.addEventListener('input', () => this.handleTextInput());
      this.textEditor.addEventListener('paste', (e) => this.handlePaste(e));
      this.textEditor.addEventListener('mouseup', () => this.updateFormatButtons());
      this.textEditor.addEventListener('keyup', () => this.updateFormatButtons());
    }

    // Control buttons
    const controlButtons = document.querySelectorAll('.control-btn');
    controlButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const transform = btn.getAttribute('data-transform');
        const format = btn.getAttribute('data-format');
        
        if (transform) {
          this.applyTransformation(transform);
        } else if (format) {
          this.applyFormatting(format);
        }
      });
    });
  }

  /**
   * Setup keyboard shortcuts
   */
  setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      if (document.activeElement === this.textEditor) {
        // Ctrl/Cmd + B for bold
        if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
          e.preventDefault();
          this.applyFormatting('bold');
        }
        // Ctrl/Cmd + I for italic
        else if ((e.ctrlKey || e.metaKey) && e.key === 'i') {
          e.preventDefault();
          this.applyFormatting('italic');
        }
        // Ctrl/Cmd + U for underline
        else if ((e.ctrlKey || e.metaKey) && e.key === 'u') {
          e.preventDefault();
          this.applyFormatting('underline');
        }
      }
    });
  }

  /**
   * Handle text input in editor
   */
  handleTextInput() {
    const content = this.textEditor.innerHTML;
    const cleanContent = this.sanitizeContent(content);
    
    if (cleanContent !== content) {
      this.textEditor.innerHTML = cleanContent;
      this.restoreCursor();
    }

    this.updateFormatButtons();
  }

  /**
   * Handle paste event
   */
  handlePaste(e) {
    e.preventDefault();
    
    const paste = e.clipboardData.getData('text/plain');
    const cleanPaste = this.escapeHtml(paste);
    
    document.execCommand('insertHTML', false, cleanPaste);
  }

  /**
   * Apply text transformation
   */
  applyTransformation(transform) {
    if (!this.textEditor) return;

    const content = this.textEditor.textContent || this.textEditor.innerText;
    let transformedText = '';

    switch (transform) {
      case 'uppercase':
        transformedText = content.toUpperCase();
        break;
      case 'lowercase':
        transformedText = content.toLowerCase();
        break;
      case 'sentence':
        transformedText = this.toSentenceCase(content);
        break;
      case 'capitalize':
        transformedText = this.toTitleCase(content);
        break;
    }

    // Replace content while preserving formatting structure
    this.textEditor.innerHTML = this.escapeHtml(transformedText);
    
    // Copy to clipboard and show feedback
    this.copyToClipboard(transformedText);
    this.showFeedback();
    
    // Add visual feedback to button
    this.addButtonFeedback(document.querySelector(`[data-transform="${transform}"]`));
  }

  /**
   * Apply text formatting
   */
  applyFormatting(format) {
    if (!this.textEditor) return;

    const selection = window.getSelection();
    
    if (selection.rangeCount > 0 && !selection.isCollapsed) {
      // Apply to selection
      document.execCommand(format, false, null);
    } else {
      // Apply to entire content
      const range = document.createRange();
      range.selectNodeContents(this.textEditor);
      selection.removeAllRanges();
      selection.addRange(range);
      document.execCommand(format, false, null);
      
      // Restore cursor position
      selection.removeAllRanges();
      range.collapse(false);
      selection.addRange(range);
    }

    this.updateFormatButtons();
    this.addButtonFeedback(document.querySelector(`[data-format="${format}"]`));
  }

  /**
   * Transform text to sentence case
   */
  toSentenceCase(text) {
    return text.toLowerCase().replace(/(^\s*\w|[.!?]\s*\w)/g, function(c) {
      return c.toUpperCase();
    });
  }

  /**
   * Transform text to title case
   */
  toTitleCase(text) {
    return text.toLowerCase().replace(/\b\w/g, function(c) {
      return c.toUpperCase();
    });
  }

  /**
   * Copy text to clipboard
   */
  async copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      // Fallback for older browsers
      return this.fallbackCopyToClipboard(text);
    }
  }

  /**
   * Fallback copy method for older browsers
   */
  fallbackCopyToClipboard(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.opacity = '0';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      return successful;
    } catch (err) {
      document.body.removeChild(textArea);
      return false;
    }
  }

  /**
   * Show feedback message
   */
  showFeedback() {
    if (!this.feedbackMessage) return;
    
    this.feedbackMessage.classList.add('show');
    
    setTimeout(() => {
      this.feedbackMessage.classList.remove('show');
    }, 2000);
  }

  /**
   * Update format button states
   */
  updateFormatButtons() {
    const formatButtons = document.querySelectorAll('[data-format]');
    
    formatButtons.forEach(btn => {
      const format = btn.getAttribute('data-format');
      const isActive = document.queryCommandState(format);
      
      if (isActive) {
        btn.classList.add('active');
        this.activeFormats.add(format);
      } else {
        btn.classList.remove('active');
        this.activeFormats.delete(format);
      }
    });
  }

  /**
   * Add visual feedback to button
   */
  addButtonFeedback(button) {
    if (!button) return;
    
    button.style.transform = 'scale(0.95)';
    setTimeout(() => {
      button.style.transform = '';
    }, 100);
  }

  /**
   * Clean and sanitize HTML content
   */
  sanitizeContent(content) {
    const allowedTags = ['b', 'strong', 'i', 'em', 'u', 's', 'strike', 'br', 'div', 'span'];
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = content;
    
    // Remove unwanted tags and attributes
    const walker = document.createTreeWalker(
      tempDiv,
      NodeFilter.SHOW_ELEMENT,
      null,
      false
    );
    
    const elementsToRemove = [];
    let currentNode;
    
    while (currentNode = walker.nextNode()) {
      if (!allowedTags.includes(currentNode.tagName.toLowerCase())) {
        elementsToRemove.push(currentNode);
      } else {
        // Remove all attributes except for basic styling
        const attributes = Array.from(currentNode.attributes);
        attributes.forEach(attr => {
          if (!['style'].includes(attr.name.toLowerCase())) {
            currentNode.removeAttribute(attr.name);
          }
        });
      }
    }
    
    // Replace unwanted elements with their content
    elementsToRemove.forEach(el => {
      const parent = el.parentNode;
      while (el.firstChild) {
        parent.insertBefore(el.firstChild, el);
      }
      parent.removeChild(el);
    });
    
    return tempDiv.innerHTML;
  }

  /**
   * Escape HTML entities
   */
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Restore cursor position
   */
  restoreCursor() {
    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(this.textEditor);
    range.collapse(false);
    selection.removeAllRanges();
    selection.addRange(range);
  }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new TextEditor();
});