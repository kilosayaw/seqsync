// src/components/common/ModalBase.jsx
import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { motion, AnimatePresence } from 'framer-motion';

const ModalBase = ({ 
    isOpen, 
    onClose, 
    title, 
    children, 
    size = 'md', 
    footerContent,
    titleClassName = "text-lg sm:text-xl font-orbitron font-semibold text-gray-100",
    headerClassName = "p-4 sm:p-5 border-b border-gray-700",
    bodyClassName = "p-4 sm:p-6 flex-grow overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800/50",
    footerClassName = "p-4 sm:p-5 border-t border-gray-700",
    modalDialogClassName = "bg-gray-800 rounded-xl shadow-2xl w-full flex flex-col border border-gray-700 max-h-[90vh]",
    closeButtonClassName = "p-1 rounded-full text-gray-400 hover:text-white hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-accent",
}) => {
  const modalRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target) && isOpen) {
        onClose();
      }
    };
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose, modalRef]);

  let sizeClasses = 'max-w-lg'; 
  if (size === 'sm') sizeClasses = 'max-w-md';
  if (size === 'lg') sizeClasses = 'max-w-2xl';
  if (size === 'xl') sizeClasses = 'max-w-4xl';
  if (size === '2xl') sizeClasses = 'max-w-2xl';
  if (size === '3xl') sizeClasses = 'max-w-3xl';
  if (size === '4xl') sizeClasses = 'max-w-4xl';
  if (size === '5xl') sizeClasses = 'max-w-5xl';
  if (size === '6xl') sizeClasses = 'max-w-6xl';
  if (size === '7xl') sizeClasses = 'max-w-7xl';
  if (size === 'full') sizeClasses = 'max-w-full h-full m-0 rounded-none';


  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };

  const modalVariants = {
    hidden: { opacity: 0, y: -20, scale: 0.98 },
    visible: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: 20, scale: 0.98, transition: { duration: 0.15 } },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-sm"
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
          transition={{ duration: 0.2 }}
        >
          <motion.div
            ref={modalRef}
            className={`${modalDialogClassName} ${sizeClasses}`}
            variants={modalVariants}
            transition={{ duration: 0.25, ease: "circOut" }}
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? "modal-title" : undefined}
          >
            {title && (
                <div className={`flex items-center justify-between ${headerClassName}`}>
                <h3 id="modal-title" className={titleClassName}>
                    {title}
                </h3>
                <button
                    onClick={onClose}
                    className={closeButtonClassName}
                    aria-label="Close modal"
                >
                    <FontAwesomeIcon icon={faTimes} className="w-5 h-5" />
                </button>
                </div>
            )}

            <div className={bodyClassName}>
              {children}
            </div>

            {footerContent && (
              <div className={footerClassName}>
                {footerContent}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

ModalBase.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.string,
  children: PropTypes.node.isRequired,
  size: PropTypes.oneOf(['sm', 'md', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl', '6xl', '7xl', 'full']),
  footerContent: PropTypes.node,
  titleClassName: PropTypes.string,
  headerClassName: PropTypes.string,
  bodyClassName: PropTypes.string,
  footerClassName: PropTypes.string,
  modalDialogClassName: PropTypes.string,
  closeButtonClassName: PropTypes.string,
};

export default ModalBase;