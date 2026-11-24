import * as DialogPrimitive from '@radix-ui/react-dialog'
import { Icon } from './icon'

/**
 * 对话框（Radix Dialog 原语 + 玻璃视觉）。
 * 焦点陷阱、Esc 关闭、读屏语义由 Radix 负责；此处只做样式与关闭按钮。
 */
export const Dialog = DialogPrimitive.Root
export const DialogTrigger = DialogPrimitive.Trigger
export const DialogClose = DialogPrimitive.Close

export interface DialogContentProps
  extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> {
  title: string
  description?: string
}

export function DialogContent({
  title,
  description,
  children,
  className = '',
  ...rest
}: DialogContentProps) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm data-[state=open]:animate-none" />
      <DialogPrimitive.Content
        className={[
          'glass glass--strong fixed left-1/2 top-1/2 z-50 w-[min(92vw,28rem)]',
          '-translate-x-1/2 -translate-y-1/2 p-6 focus:outline-none',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        {...rest}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <DialogPrimitive.Title className="text-lg font-semibold text-ink">
              {title}
            </DialogPrimitive.Title>
            {description && (
              <DialogPrimitive.Description className="mt-1.5 text-sm text-muted">
                {description}
              </DialogPrimitive.Description>
            )}
          </div>
          <DialogPrimitive.Close
            aria-label="关闭"
            className="rounded-lg p-1 text-muted transition-colors hover:bg-accent-soft hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <Icon name="close" size={18} />
          </DialogPrimitive.Close>
        </div>
        {children && <div className="mt-5">{children}</div>}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  )
}
