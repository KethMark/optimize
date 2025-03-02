import { useCopyToClipboard } from "usehooks-ts";

import React from "react";
import { Message } from "ai";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import { Button } from "./ui/button";
import { toast } from "sonner";
import { Icon } from "./ui/icon";

export const MessageActions = ({
  message,
  isLoading,
}: {
  message: Message;
  isLoading: boolean;
}) => {
  const [, copyToClipboard] = useCopyToClipboard();

  if (isLoading) return null;
  if (message.role === "user") return null;
  if (message.toolInvocations && message.toolInvocations.length > 0)
    return null;

  return (
    <TooltipProvider delayDuration={0}>
      <div className="flex flex-row items-center justify-between ">
        <div className="flex items-center gap-2">
          <Icon.Optimize className="size-8"/>
          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <Button
                  className="py-1 px-2 h-fit text-muted-foreground"
                  variant="outline"
                  onClick={async () => {
                    await copyToClipboard(message.content as string);
                    toast.success("Copied to clipboard!", {
                      position: "top-right",
                    });
                  }}
                >
                  <Icon.Copy />
                </Button>
              </div>
            </TooltipTrigger>
            <TooltipContent side="bottom" align="center">
              Copy
            </TooltipContent>
          </Tooltip>
        </div>
        <p className="text-sm hidden lg:block">
          Optimize can make a mistakes. Please double-check responses.
        </p>
        <p className="ml-3 text-sm lg:hidden">
          Double-check the responses.
        </p>
      </div>
    </TooltipProvider>
  );
};
