import { useIsMobile } from '../../hooks/useMediaQuery';
import FloatingPanel from './FloatingPanel';
import BottomSheet from './BottomSheet';

/**
 * Swaps between the desktop floating panel and the mobile bottom sheet,
 * forwarding `isOpen` to whichever one is active. `onClose` is only used by
 * BottomSheet (dragging its handle far enough down fully dismisses the
 * panel, same as the Toolbar's X button) — FloatingPanel ignores unknown
 * props so passing it there too is harmless.
 * @param {{ isOpen: boolean, onClose?: () => void, children: React.ReactNode }} props
 */
export default function ResponsivePanel({ isOpen, onClose, children }) {
  const isMobile = useIsMobile();
  const Panel = isMobile ? BottomSheet : FloatingPanel;
  return (
    <Panel isOpen={isOpen} onClose={onClose}>
      {children}
    </Panel>
  );
}
