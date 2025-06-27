// src/hooks/useKeyPress.js
import { useEffect, useCallback, useMemo } from 'react'; // Added useMemo

export const useKeyPress = (
  targetKeyOrKeys,
  callback,
  options = {}
) => {
  // Destructure options with defaults
  const {
    disabled = false,
    event = 'keydown',
    preventDefault = false,
    stopPropagation = false,
    targetNode = typeof window !== 'undefined' ? window : null,
    modifierKeys = [],
    exactMatchModifiers = false,
    ignoreInputs = true, // Added this option back as it's useful
  } = options;

  // Memoize keysToMatch so it only recalculates if targetKeyOrKeys changes
  const keysToMatch = useMemo(() => 
    (Array.isArray(targetKeyOrKeys) 
      ? targetKeyOrKeys.map(k => String(k).toLowerCase()) 
      : [String(targetKeyOrKeys).toLowerCase()]
    ), [targetKeyOrKeys]);

  // Memoize lowercasedModifierEventKeys
  const lowercasedModifierEventKeys = useMemo(() => 
    modifierKeys.map(mod => {
      const lcMod = String(mod).toLowerCase();
      if (lcMod === 'ctrl') return 'ctrlKey';
      if (lcMod === 'shift') return 'shiftKey';
      if (lcMod === 'alt') return 'altKey';
      if (lcMod === 'meta' || lcMod === 'command' || lcMod === 'cmd' || lcMod === 'windows' || lcMod === 'win') return 'metaKey';
      return lcMod; 
    }).filter(Boolean),
  [modifierKeys]);

  // Define the event handler function using useCallback
  const handler = useCallback((e) => {
    if (disabled || !targetNode || !callback) {
      return;
    }

    if (ignoreInputs) {
      const targetTagName = e.target?.tagName?.toLowerCase();
      if (targetTagName === 'input' || targetTagName === 'textarea' || targetTagName === 'select') {
        if (!keysToMatch.includes('escape')) { // Allow 'escape' even in inputs
          return; 
        }
      }
    }

    const pressedKeyLower = e.key.toLowerCase();
    const keyMatches = keysToMatch.includes(pressedKeyLower);

    if (keyMatches) {
      const specifiedModifiersPressed = lowercasedModifierEventKeys.every(modKey => e[modKey] === true);
      
      let otherModifiersPressedThatShouldNotBe = false;
      if (exactMatchModifiers) {
        const allPossibleEventModifiers = ['ctrlKey', 'shiftKey', 'altKey', 'metaKey'];
        otherModifiersPressedThatShouldNotBe = allPossibleEventModifiers.some(
            mod => !lowercasedModifierEventKeys.includes(mod) && e[mod] === true
        );
      }
      
      if (specifiedModifiersPressed && (!exactMatchModifiers || !otherModifiersPressedThatShouldNotBe)) {
        if (preventDefault) e.preventDefault();
        if (stopPropagation) e.stopPropagation();
        callback(e);
      }
    }
  }, [
    disabled, targetNode, callback, 
    keysToMatch, // Dependency for handler
    lowercasedModifierEventKeys, // Dependency for handler
    preventDefault, stopPropagation, 
    exactMatchModifiers, ignoreInputs
  ]);

  // =======================================================================
  // THIS IS THE useEffect BLOCK YOU ARE ASKING ABOUT
  // =======================================================================
  useEffect(() => {
    // If the hook is disabled or no target node is specified, do nothing.
    if (disabled || !targetNode) {
      return; // Return undefined, which means no cleanup function is needed for this case.
    }

    // Add the event listener to the target node.
    targetNode.addEventListener(event, handler);

    // Cleanup function: This will be called when the component unmounts
    // or when any of the dependencies in the array below change.
    return () => {
      targetNode.removeEventListener(event, handler);
    };
  }, [targetNode, event, handler, disabled, keysToMatch]); // Dependencies for the useEffect
  // When any of these dependencies change, the old listener is removed, and a new one is added.
  // - `targetNode`: If the element to listen on changes.
  // - `event`: If the type of event (e.g., 'keydown' vs 'keyup') changes.
  // - `handler`: If the handler function itself changes (due to its own dependencies changing).
  // - `disabled`: If the hook is enabled/disabled.
  // - `keysToMatch`: Added to satisfy exhaustive-deps and ensure the listener updates if target keys change.

  // This custom hook doesn't need to return anything explicitly.
  // Its "side effect" is setting up and tearing down the event listener.
};

// No `export default useKeyPress;` if you have `export const useKeyPress = ...`
// If you want a default export, you'd do:
// const useKeyPress = (...) => { ... }; export default useKeyPress;
// But named export `export const useKeyPress` is common and fine.