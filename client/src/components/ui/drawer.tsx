// client/src/components/ui/drawer.tsx
//
// Side-anchored drawer built on @base-ui/react's Dialog primitive.
// Same accessibility properties as a centered modal (focus trap, escape
// to close, page inerts) but slides in from the right edge — gives more
// vertical space for long forms than a centered modal.
//
// Use the same composition pattern as AlertDialog:
//   <Drawer open={...} onOpenChange={...}>
//     <DrawerContent>
//       <DrawerTitle>...</DrawerTitle>
//       <DrawerDescription>...</DrawerDescription>
//       <DrawerBody>{form}</DrawerBody>
//       <DrawerFooter>
//         <DrawerCancel>Cancel</DrawerCancel>
//         <DrawerAction onClick={save}>Save</DrawerAction>
//       </DrawerFooter>
//     </DrawerContent>
//   </Drawer>

import { type ComponentProps, type HTMLAttributes, type ReactNode } from "react";
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { cn } from "@/lib/utils";

const Drawer = DialogPrimitive.Root;
const DrawerTrigger = DialogPrimitive.Trigger;

function DrawerBackdrop({
  className,
  ...props
}: ComponentProps<typeof DialogPrimitive.Backdrop>) {
  return (
    <DialogPrimitive.Backdrop
      className={cn(
        "fixed inset-0 z-50 bg-black/40",
        "data-[open]:animate-in data-[closed]:animate-out",
        "data-[closed]:fade-out-0 data-[open]:fade-in-0",
        className,
      )}
      {...props}
    />
  );
}

/** Right-aligned panel. Fills the right half on md+ screens, full-width on mobile. */
function DrawerContent({
  className,
  children,
  ...props
}: ComponentProps<typeof DialogPrimitive.Popup>) {
  return (
    <DialogPrimitive.Portal>
      <DrawerBackdrop />
      <DialogPrimitive.Popup
        className={cn(
          "fixed top-0 right-0 z-50 h-full w-full md:max-w-xl",
          "bg-white shadow-xl border-l border-gray-200",
          "flex flex-col",
          "data-[open]:animate-in data-[closed]:animate-out",
          "data-[closed]:slide-out-to-right data-[open]:slide-in-from-right",
          className,
        )}
        {...props}
      >
        {children}
      </DialogPrimitive.Popup>
    </DialogPrimitive.Portal>
  );
}

function DrawerTitle({
  className,
  ...props
}: ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      className={cn("text-lg font-semibold px-6 pt-6", className)}
      {...props}
    />
  );
}

function DrawerDescription({
  className,
  ...props
}: ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      className={cn("text-sm text-gray-600 px-6 mt-1", className)}
      {...props}
    />
  );
}

/** Scrollable body region. Most form content goes here. */
function DrawerBody({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement> & { children?: ReactNode }) {
  return (
    <div
      className={cn("flex-1 overflow-y-auto px-6 py-4", className)}
      {...props}
    >
      {children}
    </div>
  );
}

/** Sticky footer for action buttons. */
function DrawerFooter({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement> & { children?: ReactNode }) {
  return (
    <div
      className={cn(
        "border-t border-gray-200 px-6 py-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

function DrawerCancel({
  className,
  ...props
}: ComponentProps<typeof DialogPrimitive.Close>) {
  return (
    <DialogPrimitive.Close
      className={cn(
        "inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium hover:bg-gray-50 cursor-pointer",
        className,
      )}
      {...props}
    />
  );
}

/** Primary action button. Does NOT auto-close — call onOpenChange(false) yourself after save succeeds. */
function DrawerAction({
  className,
  ...props
}: HTMLAttributes<HTMLButtonElement> & { disabled?: boolean }) {
  return (
    <button
      type="button"
      className={cn(
        "inline-flex items-center justify-center rounded-md bg-asta-red px-4 py-2 text-sm font-medium text-white hover:bg-asta-red/90 disabled:opacity-50 cursor-pointer",
        className,
      )}
      {...props}
    />
  );
}

export {
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerTitle,
  DrawerDescription,
  DrawerBody,
  DrawerFooter,
  DrawerCancel,
  DrawerAction,
};
