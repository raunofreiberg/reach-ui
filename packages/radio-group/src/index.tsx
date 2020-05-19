/**
 * Welcome to @reach/radio-group!
 *
 * @see Docs     https://reacttraining.com/reach-ui/radio-group
 * @see Source   https://github.com/reach/reach-ui/tree/master/packages/accordion
 * @see WAI-ARIA https://www.w3.org/TR/wai-aria-practices-1.2/#radiobutton
 */

import React, {
  forwardRef,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import PropTypes from "prop-types";
import {
  checkStyles,
  createNamedContext,
  isNumber,
  useForkedRef,
  warning,
  wrapEvent,
} from "@reach/utils";
import {
  createDescendantContext,
  DescendantProvider,
  useDescendant,
  useDescendantKeyDown,
  useDescendants,
} from "@reach/descendants";

const RadioGroupDescendantContext = createDescendantContext<
  HTMLElement,
  DescendantProps
>("RadioGroupDescendantContext");

const RadioGroupContext = createNamedContext<InternalRadioGroupContextValue>(
  "RadioGroupContext",
  {} as InternalRadioGroupContextValue
);

////////////////////////////////////////////////////////////////////////////////

/**
 * RadioGroup
 *
 * The wrapper component for Radio.
 *
 * @see Docs https://reacttraining.com/reach-ui/accordion#accordion-1
 */
export const RadioGroup = forwardRef(function RadioGroup(
  {
    children,
    index: controlledIndex,
    defaultIndex = null,
    onChange,
    "aria-label": ariaLabel,
    "aria-labelledby": ariaLabelledby,
    "aria-describedby": ariaDescribedBy,
    ...props
  }: RadioGroupProps,
  ref: React.Ref<HTMLDivElement>
) {
  const wasControlled = controlledIndex !== undefined;
  const { current: isControlled } = useRef(wasControlled);

  const [descendants, setDescendants] = useDescendants<
    HTMLElement,
    DescendantProps
  >();

  const [internalSelectedIndex, setInternalSelectedIndex] = useState<
    number | null
  >(defaultIndex);

  function onSelect(index: number) {
    onChange?.(index);
    descendants[index].element?.focus();

    if (!isControlled) {
      setInternalSelectedIndex(index);
    }
  }

  const context: InternalRadioGroupContextValue = {
    selectedIndex: isControlled ? controlledIndex! : internalSelectedIndex,
    onSelect,
  };

  if (__DEV__) {
    warning(
      !(!isControlled && wasControlled),
      "RadioGroup is changing from uncontrolled to controlled. RadioGroup should not switch from controlled to uncontrolled (or vice versa). Decide between using a controlled or uncontrolled RadioGroup for the lifetime of the component. Check the `index` prop being passed in."
    );
    warning(
      !(isControlled && !wasControlled),
      "RadioGroup is changing from controlled to uncontrolled. RadioGroup should not switch from uncontrolled to controlled (or vice versa). Decide between using a controlled or uncontrolled RadioGroup for the lifetime of the component. Check the `index` prop being passed in."
    );
  }

  return (
    <DescendantProvider
      context={RadioGroupDescendantContext}
      items={descendants}
      set={setDescendants}
    >
      <RadioGroupContext.Provider value={context}>
        <div
          {...props}
          ref={ref}
          // The radio buttons are contained in or owned by an element with role `radiogroup`.
          // https://www.w3.org/TR/wai-aria-practices-1.2/#wai-aria-roles-states-and-properties-16
          role="radiogroup"
          // The `radiogroup` element has a visible label referenced by `aria-labelledby`
          // or has a label specified with `aria-label`.
          // https://www.w3.org/TR/wai-aria-practices-1.2/#wai-aria-roles-states-and-properties-16
          aria-label={ariaLabel}
          aria-labelledby={ariaLabel ? undefined : ariaLabelledby}
          // If elements providing additional information about either the radio group or each radio button are present,
          // those elements are referenced by the `radiogroup` element or `radio` elements with the `aria-describedby` property.
          // https://www.w3.org/TR/wai-aria-practices-1.2/#wai-aria-roles-states-and-properties-16
          aria-describedby={ariaDescribedBy}
          data-reach-radio-group=""
        >
          {children}
        </div>
      </RadioGroupContext.Provider>
    </DescendantProvider>
  );
});

/**
 * @see Docs https://reacttraining.com/reach-ui/radio-group#radio-group-props
 */
export interface RadioGroupProps
  extends Omit<React.HTMLProps<HTMLDivElement>, "onChange"> {
  /**
   * `RadioGroup` can accept `Radio` components as children.
   *
   * @see Docs https://reacttraining.com/reach-ui/radio-group#radio-group-children
   */
  children: React.ReactNode;
  /**
   * The index of the selected radio button.
   * This should be used along with `onChange` to create controlled components.
   *
   * @see Docs https://reacttraining.com/reach-ui/radio-group#radio-group-index
   */
  index?: number | null;
  /**
   * A default value for the selected radio button index or in an uncontrolled
   * component when it is initially rendered.
   *
   * @see Docs https://reacttraining.com/reach-ui/radio-group#radio-group-defaultindex
   */
  defaultIndex?: number | null;
  /**
   * The callback that is fired when a radio button is selected.
   *
   * @see Docs https://reacttraining.com/reach-ui/radio-group#radio-group-onchange
   */
  onChange?: (index: number) => void;
  /**
   * Defines a string value that labels the current element.
   * @see Docs https://reacttraining.com/reach-ui/radio-group#accessibility
   */
  "aria-label"?: string;
  /**
   * Identifies the element (or elements) that labels the current element.
   * @see Docs https://reacttraining.com/reach-ui/radio-group#accessibility
   */
  "aria-labelledby"?: string;
  /**
   * Identifies the element (or elements) that describes the current element.
   * @see Docs https://reacttraining.com/reach-ui/radio-group#accessibility
   */
  "aria-describedby"?: string;
}

if (__DEV__) {
  RadioGroup.propTypes = {
    children: PropTypes.node.isRequired,
    index: (props, name, compName, location, propName) => {
      let val = props[name];
      if (props[name] != null && props.onChange == null && !props.readOnly) {
        return new Error(
          "You provided an `index` prop to `RadioGroup` without an `onChange` handler. This will render a read-only accordion element. If the accordion should be functional, remove the `index` value to render an uncontrolled accordion or set an `onChange` handler to set an index when a change occurs. If the accordion is intended to have a fixed state, use the `readOnly` prop with a `defaultIndex` instead of an `index`."
        );
      }
      if (props[name] != null && props.defaultIndex != null) {
        return new Error(
          "You provided an `index` prop as well as a `defaultIndex` prop to `RadioGroup`. If you want a controlled component, use the index prop with an onChange handler. If you want an uncontrolled component, remove the index prop and use `defaultIndex` instead."
        );
      }
      if (Array.isArray(props[name])) {
        return props[name].some((i: any) => !isNumber(i))
          ? new Error(
              "You provided an array as an index in `RadioGroup` but one or more of the values are not numeric. Please check to make sure all indices are valid numbers."
            )
          : null;
      } else if (props[name] != null && !isNumber(props[name])) {
        return new Error(
          `Invalid prop "${propName}" supplied to "${compName}". Expected "number", received "${
            Array.isArray(val) ? "array" : typeof val
          }".`
        );
      }
      return null;
    },
    defaultIndex: PropTypes.number,
    onChange: PropTypes.func,
  };
}

/**
 * Radio
 *
 * A radio button used inside a group.
 *
 * @see Docs https://reacttraining.com/reach-ui/radio-group#radio
 */
export const Radio = forwardRef(function Radio(
  {
    children,
    disabled,
    onClick,
    onKeyDown,
    "aria-label": ariaLabel,
    "aria-labelledby": ariaLabelledby,
    "aria-describedby": ariaDescribedBy,
  }: RadioProps,
  forwardedRef
) {
  const ownRef = useRef<any>(null);
  const ref = useForkedRef(forwardedRef, ownRef);

  const index = useDescendant({
    context: RadioGroupDescendantContext,
    element: ownRef.current,
    disabled,
  });
  const { selectedIndex, onSelect } = useContext(RadioGroupContext);

  const isInitial = selectedIndex === null && index === 0 && !disabled;
  const isSelected = index === selectedIndex;

  const descendantKeyDown = useDescendantKeyDown(RadioGroupDescendantContext, {
    currentIndex: selectedIndex,
    orientation: "both",
    key: "index",
    callback(index: number) {
      // It is possible that all `radio` buttons are initially unselected.
      // In which case, we should select the next `radio` button.
      onSelect(isInitial ? index + 1 : index);
    },
    filter: (radio) => !radio.disabled,
  });

  function handleClick() {
    onSelect(index);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === " " && !isSelected) {
      onSelect(index);
    }
    descendantKeyDown(e);
  }

  useEffect(() => checkStyles("radio-group"), []);

  return (
    <div
      ref={ref}
      // Each radio button element has role `radio`.
      // https://www.w3.org/TR/wai-aria-practices-1.2/#wai-aria-roles-states-and-properties-16
      role="radio"
      // If a radio button is checked, the radio element has aria-checked set to true.
      // If it is not checked, it has aria-checked set to false.
      // https://www.w3.org/TR/wai-aria-practices-1.2/#wai-aria-roles-states-and-properties-16
      aria-checked={isSelected}
      // Each `radio` element is labelled by its content, has a visible label referenced by `aria-labelledby`,
      // or has a label specified with `aria-label`.
      // https://www.w3.org/TR/wai-aria-practices-1.2/#wai-aria-roles-states-and-properties-16
      aria-label={ariaLabel}
      aria-labelledby={ariaLabel ? undefined : ariaLabelledby}
      // If elements providing additional information about either the radio group or each radio button are present,
      // those elements are referenced by the `radiogroup` element or `radio` elements with the `aria-describedby` property.
      // https://www.w3.org/TR/wai-aria-practices-1.2/#wai-aria-roles-states-and-properties-16
      aria-describedby={ariaDescribedBy}
      data-disabled={disabled}
      data-reach-radio=""
      onClick={wrapEvent(onClick, handleClick)}
      onKeyDown={wrapEvent(onKeyDown, handleKeyDown)}
      // On page load, `tabIndex={0}` is set on the first `radio` button in the `radio` group.
      tabIndex={isInitial ? 0 : index === selectedIndex ? 0 : -1}
    >
      {children}
    </div>
  );
});

/**
 * @see Docs https://reacttraining.com/reach-ui/radio-group#radio-props
 */
export interface RadioProps {
  children?: React.ReactNode;
  /**
   * Whether or not a radio button is disabled from user interaction.
   *
   * @see Docs https://reacttraining.com/reach-ui/radio-group#radio-disabled
   */
  disabled?: boolean;
  onClick?: (event: React.MouseEvent) => void;
  onKeyDown?: (event: React.KeyboardEvent) => void;
  /**
   * Defines a string value that labels the current element.
   * @see Docs https://reacttraining.com/reach-ui/radio-group#accessibility
   */
  "aria-label"?: string;
  /**
   * Identifies the element (or elements) that labels the current element.
   * @see Docs https://reacttraining.com/reach-ui/radio-group#accessibility
   */
  "aria-labelledby"?: string;
  /**
   * Identifies the element (or elements) that describes the current element.
   * @see Docs https://reacttraining.com/reach-ui/radio-group#accessibility
   */
  "aria-describedby"?: string;
}

if (__DEV__) {
  Radio.propTypes = {
    children: PropTypes.node.isRequired,
    disabled: PropTypes.bool,
  };
}

interface InternalRadioGroupContextValue {
  selectedIndex: number | null;
  onSelect: (index: number) => void;
}

type DescendantProps = {
  disabled?: boolean;
};
