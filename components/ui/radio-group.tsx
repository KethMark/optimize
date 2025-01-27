"use client";

import * as React from "react";
import * as RadioGroupPrimitives from "@radix-ui/react-radio-group";

import { cn } from "@/lib/utils";

// Based on Tremor Raw RadioGroup [v0.0.0]

const RadioGroup = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitives.Root>
>(({ className, ...props }, forwardedRef) => {
  return (
    <RadioGroupPrimitives.Root
      ref={forwardedRef}
      className={cn("grid gap-2", className)}
      {...props}
    />
  );
});
RadioGroup.displayName = "RadioGroup";

const RadioGroupItem = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitives.Item>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitives.Item> & {
    icon: React.ElementType;
  }
>(({ className, icon, ...props }, forwardedRef) => {
  const Icon = icon;
  return (
    <RadioGroupPrimitives.Item
      ref={forwardedRef}
      className={cn(
        "group relative flex size-8 appearance-none items-center justify-center outline-none",
        className
      )}
      {...props}
    >
      <div
        className={cn(
          // base
          "flex size-full shrink-0 items-center justify-center rounded-lg text-gray-700 dark:text-gray-400",
          // background color
          "bg-transparent",
          // checked
          "group-data-[state=checked]:bg-orange-50 group-data-[state=checked]:text-orange-600 dark:group-data-[state=checked]:bg-orange-500/20 dark:group-data-[state=checked]:text-orange-300"
        )}
      >
        <Icon className="size-4 text-inherit" />
      </div>
    </RadioGroupPrimitives.Item>
  );
});
RadioGroupItem.displayName = "RadioGroupItem";

export { RadioGroup, RadioGroupItem };
