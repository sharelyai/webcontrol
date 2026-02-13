import React, { useState, ReactNode } from 'react';
import {
  useFloating,
  autoUpdate,
  offset,
  flip,
  shift,
  useHover,
  useFocus,
  useDismiss,
  useRole,
  useInteractions,
  FloatingPortal,
} from '@floating-ui/react';
import styled, { css } from 'styled-components';

interface TooltipProps {
  children: ReactNode;
  text: string;
  placement?: 'top' | 'bottom' | 'left' | 'right';
}

const TooltipContent = styled.div`
  ${({ theme }) => css`
    background-color: ${theme.colors.ebony};
    color: ${theme.colors.white};
    padding: 4px 8px;
    border-radius: 4px;
    font-size: ${theme.fonts.xs};
    z-index: 10000;
    pointer-events: none;
  `}
`;

export const Tooltip = ({ children, text, placement = 'top' }: TooltipProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const { refs, floatingStyles, context } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
    placement,
    whileElementsMounted: autoUpdate,
    middleware: [
      offset(5),
      flip({
        fallbackAxisSideDirection: 'start',
      }),
      shift(),
    ],
  });

  const hover = useHover(context, { move: false });
  const focus = useFocus(context);
  const dismiss = useDismiss(context);
  const role = useRole(context, { role: 'tooltip' });

  const { getReferenceProps, getFloatingProps } = useInteractions([
    hover,
    focus,
    dismiss,
    role,
  ]);

  return (
    <>
      <div ref={refs.setReference} {...getReferenceProps()} style={{ display: 'inline-block' }}>
        {children}
      </div>
      {isOpen && (
        <FloatingPortal>
          <TooltipContent
            ref={refs.setFloating}
            style={floatingStyles}
            {...getFloatingProps()}
          >
            {text}
          </TooltipContent>
        </FloatingPortal>
      )}
    </>
  );
};
