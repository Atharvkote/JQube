"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner, toast as rawToast, type ToasterProps } from "sonner"
import { CircleCheckIcon, InfoIcon, TriangleAlertIcon, OctagonXIcon, Loader2Icon } from "lucide-react"
import { splitToastMessage } from "@/utils/toastHelper"

export const toast = Object.assign(
  (message: any, options?: any) => {
    if (typeof message === 'string') {
      const { title, description } = splitToastMessage(message);
      return rawToast(title, { ...options, description });
    }
    return rawToast(message, options);
  },
  {
    success: (message: any, options?: any) => {
      if (typeof message === 'string') {
        const { title, description } = splitToastMessage(message);
        return rawToast.success(title, { ...options, description });
      }
      return rawToast.success(message, options);
    },
    error: (message: any, options?: any) => {
      if (typeof message === 'string') {
        const { title, description } = splitToastMessage(message);
        return rawToast.error(title, { ...options, description });
      }
      return rawToast.error(message, options);
    },
    warning: (message: any, options?: any) => {
      if (typeof message === 'string') {
        const { title, description } = splitToastMessage(message);
        return rawToast.warning(title, { ...options, description });
      }
      return rawToast.warning(message, options);
    },
    info: (message: any, options?: any) => {
      if (typeof message === 'string') {
        const { title, description } = splitToastMessage(message);
        return rawToast.info(title, { ...options, description });
      }
      return rawToast.info(message, options);
    },
    loading: (message: any, options?: any) => {
      if (typeof message === 'string') {
        const { title, description } = splitToastMessage(message);
        return rawToast.loading(title, { ...options, description });
      }
      return rawToast.loading(message, options);
    },
    dismiss: rawToast.dismiss,
    custom: rawToast.custom,
  }
);

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      icons={{
        success: (
          <CircleCheckIcon className="size-4" />
        ),
        info: (
          <InfoIcon className="size-4" />
        ),
        warning: (
          <TriangleAlertIcon className="size-4" />
        ),
        error: (
          <OctagonXIcon className="size-4" />
        ),
        loading: (
          <Loader2Icon className="size-4 animate-spin" />
        ),
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius)",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast: "cn-toast",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }

