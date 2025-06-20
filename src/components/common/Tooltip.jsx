import React, { useState, useRef } from 'react';
import PropTypes from 'prop-types';
import { motion, AnimatePresence } from 'framer-motion';

const Tooltip = ({ children, content, placement = 'top', delay = 100, className = '', wrapperElementType = 'div' }) => {
  const [isVisible, setIsVisible] = useState(false);
  const timeoutRef = useRef(null);
  
  // Call useId unconditionally at the top level
  const tooltipId = `tooltip-${React.useId()}`; 

  const WrapperElement = wrapperElementType;

  const showTooltip = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (content) { // Only set timeout if there's content to show
        timeoutRef.current = setTimeout(() => {
            setIsVisible(true);
        }, delay);
    }
  };

  const hideTooltip = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsVisible(false);
  };
  
  let positionClasses = '';
  switch (placement) {
    case 'top': positionClasses = 'bottom-full left-1/2 -translate-x-1/2 mb-2'; break;
    case 'bottom': positionClasses = 'top-full left-1/2 -translate-x-1/2 mt-2'; break;
    case 'left': positionClasses = 'top-1/2 -translate-y-1/2 right-full mr-2'; break;
    case 'right': positionClasses = 'top-1/2 -translate-y-1/2 left-full ml-2'; break;
    default: positionClasses = 'bottom-full left-1/2 -translate-x-1/2 mb-2';
  }

  return (
    <WrapperElement
      className={`relative inline-flex ${className}`}
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      onFocusCapture={showTooltip}
      onBlurCapture={hideTooltip}  
    >
      {children}
      <AnimatePresence>
        {isVisible && content && (
          <motion.div
            initial={{ opacity: 0, y: placement === 'top' ? 5 : (placement === 'bottom' ? -5 : 0) }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: placement === 'top' ? 5 : (placement === 'bottom' ? -5 : 0), transition: {duration: 0.1} }}
            transition={{ duration: 0.15 }}
            className={`absolute ${positionClasses} z-[150] px-2.5 py-1.5 text-xs sm:text-sm text-white bg-gray-800 rounded-md shadow-lg whitespace-nowrap border border-gray-700`}
            role="tooltip"
            id={tooltipId} // Use the unconditionally generated ID
          >
            {content}
          </motion.div>
        )}
      </AnimatePresence>
    </WrapperElement>
  );
};

Tooltip.propTypes = {
  children: PropTypes.node.isRequired,
  content: PropTypes.node,
  placement: PropTypes.oneOf(['top', 'bottom', 'left', 'right']),
  delay: PropTypes.number,
  className: PropTypes.string,
  wrapperElementType: PropTypes.elementType,
};

export default Tooltip;