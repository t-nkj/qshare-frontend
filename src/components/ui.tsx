import type { ButtonHTMLAttributes, ReactNode } from "react"
import { tv, type VariantProps } from "tailwind-variants"

const buttonStyles = tv({
    base: "inline-flex shrink-0 items-center justify-center rounded-full font-semibold transition duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500 disabled:cursor-not-allowed disabled:opacity-50",
    variants: {
        tone: {
            primary:
                "bg-gradient-to-br from-sky-500 to-blue-600 text-white shadow-lg shadow-sky-500/25 hover:scale-105 hover:from-sky-400 hover:to-blue-500 active:scale-100",
            secondary:
                "border border-white/70 bg-white/55 text-slate-700 shadow-lg shadow-slate-950/5 backdrop-blur-xl hover:scale-105 hover:bg-white/80 active:scale-100",
            danger: "bg-rose-500 text-white shadow-lg shadow-rose-500/20 hover:scale-105 hover:bg-rose-600 active:scale-100"
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
    base: "w-full border border-white/70 bg-white/55 text-slate-950 shadow-inner shadow-slate-950/5 outline-none backdrop-blur-xl transition placeholder:text-slate-400 focus:border-sky-300 focus:bg-white/80 focus:ring-4 focus:ring-sky-200/50 disabled:bg-slate-100 disabled:text-slate-500",
    variants: {
        kind: {
            default: "h-11 rounded-2xl px-4 text-sm",
            composer:
                "h-12 min-w-0 flex-1 border-transparent bg-transparent px-3 text-base shadow-none focus:border-transparent focus:bg-transparent focus:ring-0"
        }
    },
    defaultVariants: {
        kind: "default"
    }
})

export const glassPanel = tv({
    base: "border border-white/70 bg-white/55 shadow-xl shadow-slate-950/10 backdrop-blur-2xl",
    variants: {
        radius: {
            card: "rounded-3xl",
            pill: "rounded-full"
        }
    },
    defaultVariants: {
        radius: "card"
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
    base: "inline-flex size-10 shrink-0 items-center justify-center rounded-full text-xl font-medium transition duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500 disabled:cursor-not-allowed disabled:opacity-40",
    variants: {
        tone: {
            neutral:
                "border border-white/70 bg-white/55 text-slate-600 shadow-lg shadow-slate-950/5 backdrop-blur-xl hover:scale-105 hover:bg-white/80",
            danger: "bg-white/40 text-slate-400 hover:scale-105 hover:bg-rose-100/70 hover:text-rose-600"
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
