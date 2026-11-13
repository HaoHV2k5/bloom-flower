import * as Tooltip from '@radix-ui/react-tooltip';
import * as Dialog from '@radix-ui/react-dialog';
import { ArrowUpRight, Heart, LockKeyhole, X } from 'lucide-react';

export function IconButton({ label, children, ...props }) {
  return <Tooltip.Root>
    <Tooltip.Trigger asChild><button type="button" className="icon-button" aria-label={label} {...props}>{children}</button></Tooltip.Trigger>
    <Tooltip.Portal><Tooltip.Content className="tooltip" sideOffset={9}>{label}<Tooltip.Arrow className="tooltip-arrow" /></Tooltip.Content></Tooltip.Portal>
  </Tooltip.Root>;
}

export function HelpDialog() {
  return <Dialog.Root>
    <Dialog.Trigger asChild><button type="button" className="help-link">Một gợi ý nhỏ <ArrowUpRight size={14} /></button></Dialog.Trigger>
    <Dialog.Portal>
      <Dialog.Overlay className="dialog-overlay" />
      <Dialog.Content className="help-dialog">
        <Heart className="dialog-heart" size={30} strokeWidth={1.25} />
        <Dialog.Title>Một ngày thật đặc biệt.</Dialog.Title>
        <Dialog.Description>Mật mã là một ngày và một tháng, gồm 4 chữ số. Có một ngày nho nhỏ rất đáng nhớ, chị còn nhớ không?</Dialog.Description>
        <p className="hint-example"><LockKeyhole size={15} /> Ngày trước, tháng sau. Thử nghĩ xem nhé.</p>
        <Dialog.Close asChild><button className="primary-button">Để chị thử nhé <ArrowUpRight size={17} /></button></Dialog.Close>
        <Dialog.Close asChild><button className="dialog-close icon-button" aria-label="Đóng gợi ý"><X size={19} /></button></Dialog.Close>
      </Dialog.Content>
    </Dialog.Portal>
  </Dialog.Root>;
}
