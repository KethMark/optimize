import { Message } from "ai";
import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { SparklesIcon } from "lucide-react";
import { Markdown } from "./markdown";
import { MessageActions } from "./message-action";

export const PreviewMessage = ({
  message,
  isLoading,
  isLast
}: {
  message: Message;
  isLoading: boolean;
  isLast: boolean;
}) => {
  return (
    <motion.div
      className="w-full mx-auto max-w-4xl px-4 group/message"
      initial={{ y: 5, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      data-role={message.role}
    >
      <div
        className={cn(
          "flex gap-4 w-full rounded-xl",
          message.role === "user" ? "justify-start" : "justify-end",
          message.role === "user" 
            ? "bg-blue-200 px-3 py-2 w-fit max-w-4xl" 
            : ""
        )}
      >
        {message.role === "assistant" && (
          <div className="size-8 flex items-center rounded-full justify-center ring-1 shrink-0 ring-border">
            <SparklesIcon size={14} className="stroke-orange-600"/>
          </div>
        )}
        <div className="flex flex-col gap-2 w-full">
          {message.content && (
            <div className="flex flex-col gap-4">
              <Markdown>{message.content}</Markdown>
            </div>
          )}

          {isLast && (
            <MessageActions
              key={`action-${message.id}`}
              message={message}
              isLoading={isLoading}
            />
          )}
        </div>
      </div>
    </motion.div>
  );
};

export const ThinkingMessage = () => {
  return (
    <motion.div
      className="w-full mx-auto max-w-3xl px-4 group/message"
      initial={{ y: 5, opacity: 0 }}
      animate={{ y: 0, opacity: 1, transition: { delay: 1 } }}
      data-role="assistant"
    >
      <div className="flex gap-4 w-full rounded-xl">
        <div className="size-8 flex items-center rounded-full justify-center ring-1 shrink-0 ring-border">
          <SparklesIcon size={14} />
        </div>
        <div className="flex flex-col gap-2 w-full">
          <div className="flex flex-col gap-4 text-muted-foreground">
            Thinking...
          </div>
        </div>
      </div>
    </motion.div>
  );
};