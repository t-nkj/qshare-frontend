import type { ButtonHTMLAttributes, ReactNode } from "react"
import { tv, type VariantProps } from "tailwind-variants"

const buttonStyles = tv({
    base: "inline-flex shrink-0 cursor-pointer items-center justify-center rounded-full font-semibold transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500 disabled:cursor-not-allowed disabled:opacity-50",
    variants: {
        tone: {
            primary: "bg-blue-600 text-white shadow-lg shadow-blue-500/25 hover:bg-blue-700",
            secondary:
                "border border-white/70 bg-white/55 text-slate-700 shadow-lg shadow-slate-950/5 backdrop-blur-xl hover:bg-slate-200/80 hover:text-slate-950",
            danger: "bg-rose-600 text-white shadow-lg shadow-rose-900/20 hover:bg-rose-700"
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
                "h-12 min-w-0 flex-1 rounded-2xl border-transparent bg-white/40 px-3 text-base shadow-none focus:border-transparent focus:bg-white/65 focus:ring-0"
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

export const Button = ({ children, className, tone, size, type = "button", ...props }: ButtonProps) => {
    return (
        <button type={type} className={buttonStyles({ tone, size, className })} {...props}>
            {children}
        </button>
    )
}

const iconButtonStyles = tv({
    base: "inline-flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-full text-xl font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500 disabled:cursor-not-allowed disabled:opacity-40",
    variants: {
        tone: {
            neutral:
                "border border-white/70 bg-white/55 text-slate-600 shadow-lg shadow-slate-950/5 backdrop-blur-xl transition-colors duration-300 hover:bg-slate-200/80 hover:text-slate-950",
            danger: "bg-white/40 text-slate-400 transition-colors duration-150 hover:bg-rose-100/70 hover:text-rose-600"
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

export const IconButton = ({ label, children, className, tone, type = "button", ...props }: IconButtonProps) => {
    return (
        <button type={type} aria-label={label} className={iconButtonStyles({ tone, className })} {...props}>
            {children}
        </button>
    )
}
