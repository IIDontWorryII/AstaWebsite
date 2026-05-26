// client/src/components/ui/alert-dialog.tsx
//
// shadcn-style wrapper around @base-ui/react's AlertDialog primitive.
// AlertDialog is the same shape as Dialog but signals to assistive tech
// that the dialog requires user acknowledgement (e.g. confirm a destructive
// action) — focus is trapped and the underlying page is inert until closed.
//
// Composed of named parts so callers can mix and match:
//   <AlertDialog>
//     <AlertDialogTrigger>Open</AlertDialogTrigger>
//     <AlertDialogContent>
//       <AlertDialogTitle>...</AlertDialogTitle>
//       <AlertDialogDescription>...</AlertDialogDescription>
//       <AlertDialogFooter>
//         <AlertDialogCancel>Cancel</AlertDialogCancel>
//         <AlertDialogAction onClick={...}>Delete</AlertDialogAction>
//       </AlertDialogFooter>
//     </AlertDialogContent>
//   </AlertDialog>

import {
  type ComponentProps,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { AlertDialog as AlertDialogPrimitive } from "@base-ui/react/alert-dialog";
import { cn } from "@/lib/utils";

// Re-exports of the primitives that don't need styling.
const AlertDialog = AlertDialogPrimitive.Root;
const AlertDialogTrigger = AlertDialogPrimitive.Trigger;

/** Dimmed backdrop behind the dialog. Click closes the dialog. */
function AlertDialogBackdrop({
  className,
  ...props
}: ComponentProps<typeof AlertDialogPrimitive.Backdrop>) {
  return (
    <AlertDialogPrimitive.Backdrop
      className={cn(
        "fixed inset-0 z-50 bg-black/50",
        "data-[open]:animate-in data-[closed]:animate-out",
        "data-[closed]:fade-out-0 data-[open]:fade-in-0",
        className,
      )}
      {...props}
    />
  );
}

/** Centered popup with default card styling. Always rendered inside Portal. */
function AlertDialogContent({
  className,
  children,
  ...props
}: ComponentProps<typeof AlertDialogPrimitive.Popup>) {
  return (
    <AlertDialogPrimitive.Portal>
      <AlertDialogBackdrop />
      <AlertDialogPrimitive.Popup
        className={cn(
          "fixed left-1/2 top-1/2 z-50 grid w-full max-w-md -translate-x-1/2 -translate-y-1/2 gap-4 rounded-lg border bg-white p-6 shadow-lg",
          "data-[open]:animate-in data-[closed]:animate-out",
          "data-[closed]:fade-out-0 data-[open]:fade-in-0",
          "data-[closed]:zoom-out-95 data-[open]:zoom-in-95",
          className,
        )}
        {...props}
      >
        {children}
      </AlertDialogPrimitive.Popup>
    </AlertDialogPrimitive.Portal>
  );
}

function AlertDialogTitle({
  className,
  ...props
}: ComponentProps<typeof AlertDialogPrimitive.Title>) {
  return (
    <AlertDialogPrimitive.Title
      className={cn("text-lg font-semibold", className)}
      {...props}
    />
  );
}

function AlertDialogDescription({
  className,
  ...props
}: ComponentProps<typeof AlertDialogPrimitive.Description>) {
  return (
    <AlertDialogPrimitive.Description
      className={cn("text-sm text-gray-600", className)}
      {...props}
    />
  );
}

/** Just a flex container for the buttons at the bottom. */
function AlertDialogFooter({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement> & { children?: ReactNode }) {
  return (
    <div
      className={cn(
        "mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

/** "No / Cancel" button. Clicking closes the dialog. */
function AlertDialogCancel({
  className,
  ...props
}: ComponentProps<typeof AlertDialogPrimitive.Close>) {
  return (
    <AlertDialogPrimitive.Close
      className={cn(
        "inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium hover:bg-gray-50 cursor-pointer",
        className,
      )}
      {...props}
    />
  );
}

/**
 * "Yes / Confirm" button. Renders as AlertDialogPrimitive.Close so the
 * dialog auto-closes after the click, then your onClick handler runs.
 * Style defaults to destructive (red) since the most common use is
 * confirming a delete.
 */
function AlertDialogAction({
  className,
  ...props
}: ComponentProps<typeof AlertDialogPrimitive.Close>) {
  return (
    <AlertDialogPrimitive.Close
      className={cn(
        "inline-flex items-center justify-center rounded-md bg-asta-red px-4 py-2 text-sm font-medium text-white hover:bg-asta-red/90 cursor-pointer",
        className,
      )}
      {...props}
    />
  );
}

export {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
};
