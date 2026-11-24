import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu'

/**
 * 下拉菜单（Radix DropdownMenu 原语 + 玻璃视觉）。
 * 键盘导航、方向键、Esc、读屏角色由 Radix 负责；此处只做玻璃样式。
 */
export const DropdownMenu = DropdownMenuPrimitive.Root
export const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger

export interface DropdownContentProps
  extends React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Content> {}

export function DropdownContent({
  children,
  className = '',
  sideOffset = 8,
  ...rest
}: DropdownContentProps) {
  return (
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.Content
        sideOffset={sideOffset}
        className={[
          'glass glass--strong z-50 min-w-44 p-1.5 focus:outline-none',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        {...rest}
      >
        {children}
      </DropdownMenuPrimitive.Content>
    </DropdownMenuPrimitive.Portal>
  )
}

export interface DropdownItemProps
  extends React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Item> {
  /** 危险操作用红色文字 */
  danger?: boolean
}

export function DropdownItem({
  children,
  danger = false,
  className = '',
  ...rest
}: DropdownItemProps) {
  return (
    <DropdownMenuPrimitive.Item
      className={[
        'flex cursor-pointer select-none items-center rounded-lg px-3 py-2 text-sm outline-none',
        'data-[highlighted]:bg-accent-soft data-[highlighted]:text-accent',
        'data-[disabled]:pointer-events-none data-[disabled]:opacity-45',
        danger
          ? 'text-error data-[highlighted]:bg-error/10 data-[highlighted]:text-error'
          : 'text-ink',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...rest}
    >
      {children}
    </DropdownMenuPrimitive.Item>
  )
}

export const DropdownSeparator = DropdownMenuPrimitive.Separator
