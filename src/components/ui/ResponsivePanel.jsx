import { useIsMobile } from '../../hooks/useMediaQuery';
import FloatingPanel from './FloatingPanel';
import BottomSheet from './BottomSheet';

/**
 * Swaps between the desktop floating panel and the mobile bottom sheet,
 * forwarding `isOpen` to whichever one is active.
 * @param {{ isOpen: boolean, children: React.ReactNode }} props
 */
export default function ResponsivePanel({ isOpen, children }) {
  const isMobile = useIsMobile();
  const Panel = isMobile ? BottomSheet : FloatingPanel;
  return <Panel isOpen={isOpen}>{children}</Panel>;
}
