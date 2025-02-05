import { Message } from "ai";
import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { SparklesIcon } from "lucide-react";
import { Markdown } from "./markdown";
import { MessageActions } from "./message-action";
import { Icon } from "./ui/icon";

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
            ? "bg-orange-300 dark:bg-orange-500 px-3 py-2 w-fit max-w-4xl" 
            : ""
        )}
      >
        {message.role === "assistant" && (
          <Icon.Optimize/>
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
      <div className="flex items-center gap-2 w-full rounded-xl">
        <Icon.Optimize/>
        <div className="flex flex-col gap-1 w-full">
          <div className="flex flex-col gap-2 text-muted-foreground">
            Thinking...
          </div>
        </div>
      </div>
    </motion.div>
  );
};