import type { ButtonHTMLAttributes, ReactNode } from "react"
import { tv, type VariantProps } from "tailwind-variants"

const buttonStyles = tv({
    base: "inline-flex shrink-0 items-center justify-center rounded-full font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 disabled:cursor-not-allowed disabled:opacity-50",
    variants: {
        tone: {
            primary: "bg-blue-600 text-white shadow-sm hover:bg-blue-700 active:bg-blue-800",
            secondary:
                "border border-slate-200 bg-white text-slate-700 shadow-sm hover:bg-slate-50 active:bg-slate-100",
            danger: "bg-rose-600 text-white hover:bg-rose-700 active:bg-rose-800"
        },
        size: {
            normal: "h-11 px-5 text-sm",
            small: "h-9 px-4 text-sm",
            composer: "h-12 px-5 text-sm sm:px-6"
        }
    },
    defaultVariants: {
        tone: "primary",
        size: "normal"
    }
})

export const inputStyles = tv({
    base: "w-full border border-slate-200 bg-white text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-100 disabled:text-slate-500",
    variants: {
        kind: {
            default: "h-11 rounded-2xl px-4 text-sm",
            composer:
                "h-12 min-w-0 flex-1 border-transparent bg-transparent px-3 text-base focus:border-transparent focus:ring-0"
        }
    },
    defaultVariants: {
        kind: "default"
    }
})

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonStyles> {
    children: ReactNode
}

export function Button({ children, className, tone, size, type = "button", ...props }: ButtonProps) {
    return (
        <button type={type} className={buttonStyles({ tone, size, className })} {...props}>
            {children}
        </button>
    )
}

const iconButtonStyles = tv({
    base: "inline-flex size-10 shrink-0 items-center justify-center rounded-full text-xl font-medium transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 disabled:cursor-not-allowed disabled:opacity-40",
    variants: {
        tone: {
            neutral: "bg-white text-slate-600 shadow-sm ring-1 ring-slate-200 hover:bg-slate-100",
            danger: "bg-slate-50 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
        }
    },
    defaultVariants: {
        tone: "neutral"
    }
})

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof iconButtonStyles> {
    label: string
    children: ReactNode
}

export function IconButton({ label, children, className, tone, type = "button", ...props }: IconButtonProps) {
    return (
        <button type={type} aria-label={label} className={iconButtonStyles({ tone, className })} {...props}>
            {children}
        </button>
    )
}
