"use client";

import React, { useCallback } from "react";
import { motion } from "framer-motion";
import {
  ArrowUp,
  BarChart2,
  BookOpen,
  CircleStop,
  Info,
  RotateCw,
} from "lucide-react";
import cx from "classnames";
import { useEffect, useRef } from "react";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { useChat, Message } from "ai/react";
import type {
  ToolbarSlot,
  TransformToolbarSlot,
} from "@react-pdf-viewer/toolbar";
import { toolbarPlugin } from "@react-pdf-viewer/toolbar";
import { pageNavigationPlugin } from "@react-pdf-viewer/page-navigation";
import { Viewer, Worker } from "@react-pdf-viewer/core";
import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";
import { useScrollToBottom } from "@/components/ui/scroll-bottom";
import { PreviewMessage, ThinkingMessage } from "@/components/message";
import { Icon } from "@/components/ui/icon";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useWindowSize } from "usehooks-ts";

const suggestedActions = [
  {
    icon: BookOpen,
    title: "Summarize",
    action: "what is the summary of these documents?",
  },
  {
    icon: BarChart2,
    title: "Get Insights",
    action: "what insights can you derive from this data?",
  },
  {
    icon: Info,
    title: "Explain Simply",
    action: "can you explain this concept in simple terms?",
  },
];

export const ChatInterface = ({ document }: documents) => {
  const chatId = document.id;
  const pdfUrl = document.fileUrl;

  const pageNavigationPluginInstance = pageNavigationPlugin();
  const toolbarPluginInstance = toolbarPlugin();
  const { renderDefaultToolbar, Toolbar } = toolbarPluginInstance;

  const transform: TransformToolbarSlot = (slot: ToolbarSlot) => ({
    ...slot,
    Search: () => <></>,
    PrintMenuItem: () => <></>,
    Download: () => <></>,
    SwitchTheme: () => <></>,
    Open: () => <></>,
    EnterFullScreen: () => <></>,
  });
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { width } = useWindowSize();
  const formRef = useRef<HTMLFormElement>(null);
  const [messagesContainerRef, messagesEndRef] =
    useScrollToBottom<HTMLDivElement>();

  const { data: conversation } = useQuery<Message[]>({
    queryKey: ["chat", chatId],
    queryFn: async () => {
      try {
        const response = await axios.post<Message[]>("/api/conversation", {
          chatId,
        });
        return response.data;
      } catch (error) {
        console.error("Error fetching conversation:", error);
        return [];
      }
    },
    retry: false,
  });

  const {
    messages,
    input,
    handleSubmit,
    stop,
    reload,
    error,
    isLoading,
    append,
    setInput,
  } = useChat({
    body: {
      chatId,
    },
    initialMessages: conversation || [],
    onError: (err) => {
      console.log(err.message);
    },
  });

  useEffect(() => {
    if (textareaRef.current) {
      adjustHeight();
    }
  }, []);

  const adjustHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"; // Reset height before adjusting
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`; // Set height based on content
    }
  };

  const resetHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = "98px";
    }
  };

  const handleInput = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(event.target.value);
    adjustHeight();
  };

  const submitForm = useCallback(
    (e: any) => {
      handleSubmit(e as React.KeyboardEvent<HTMLTextAreaElement>);
      resetHeight();

      if (width && width > 768) {
        textareaRef.current?.focus();
      }
    },
    [handleSubmit, width]
  );

  const isLastMessage = messages.length === 12;
  const islastMessageWarning =
    messages.length === 10 ? "1 lastmessage request left. until 24hrs" : null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-[calc(96vh-4rem)]">
      <div className="hidden lg:block">
        <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.js">
          <div className="w-full h-[84vh] flex-col text-white hidden lg:flex">
            <div
              className="align-center bg-[#eeeeee] flex p-1"
              style={{
                borderBottom: "1px solid rgba(0, 0, 0, 0.1)",
              }}
            >
              <Toolbar>{renderDefaultToolbar(transform)}</Toolbar>
            </div>
            <Viewer
              fileUrl={pdfUrl as string}
              plugins={[toolbarPluginInstance, pageNavigationPluginInstance]}
            />
          </div>
        </Worker>
      </div>
      <div className="flex flex-col min-w-0 h-[calc(96vh-4rem)] bg-background">
        <div
          ref={messagesContainerRef}
          className="flex flex-col min-w-0 gap-6 flex-1 pt-4 overflow-y-auto"
        >
          {messages.length === 0 && (
            <motion.div
              key='logo'
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ delay: 0.5 }}
            >
              <div className="mx-auto max-w-xl lg:mt-6">
                <div className="flex flex-col items-center h-[calc(50vh-4rem)] justify-center gap-4">
                  <Icon.Optimize className="size-16"/>
                  <p className="text-4xl font-semibold">Optimize</p>
                </div>
              </div>
            </motion.div>
          )}

          {messages.map((message, index) => (
            <PreviewMessage
              key={`${message.id}-${index}`}
              message={message}
              isLoading={isLoading && messages.length - 1 === index}
              isLast={index === messages.length - 1}
            />
          ))}

          {isLoading &&
            messages.length > 0 &&
            messages[messages.length - 1].role === "user" && (
              <ThinkingMessage />
            )}

          <div
            ref={messagesEndRef}
            className="shrink-0 min-w-[24px] min-h-[24px]"
          />
        </div>
        <form className="flex mx-auto px-4 bg-background gap-2 w-full md:max-w-4xl">
          <div className="relative w-full flex flex-col gap-4">
            {messages.length === 0 && (
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-4">
                {suggestedActions.map((suggestedAction, index) => {
                  const Icon = suggestedAction.icon;
                  return (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 20 }}
                      transition={{ delay: 0.05 * index }}
                      key={`suggested-action-${suggestedAction.title}-${index}`}
                      className={index > 2 ? "hidden sm:block" : "block"}
                    >
                      <button
                        onClick={async () => {
                          append({
                            role: "user",
                            content: suggestedAction.action,
                          });
                        }}
                        className="lg:w-full"
                      >
                        <span className="flex items-center justify-center gap-2 px-5 py-4">
                          <Icon className="stroke-orange-600" />
                          {suggestedAction.title}
                        </span>
                      </button>
                    </motion.div>
                  );
                })}
              </div>
            )}
            <Textarea
              ref={textareaRef}
              placeholder={
                messages.length === 0
                  ? "Ask optimize about your pdf..."
                  : "Ask optimize follow up question..."
              }
              value={input}
              disabled={isLoading || !!error || isLastMessage}
              onChange={handleInput}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  submitForm(event);
                }
              }}
              className={cx(
                "min-h-[24px] max-h-[calc(75dvh)] overflow-hidden resize-none rounded-2xl !text-base bg-muted pb-10 dark:border-zinc-700"
              )}
              rows={2}
              autoFocus
            />

            <div className="absolute bottom-0 p-3 w-fit flex flex-row justify-start">
              <p className="text-muted-foreground text-sm">
                llama-3.3-70b-versatile
              </p>
            </div>

            <div className="absolute bottom-0 right-0 p-2 w-fit flex flex-row items-center gap-2 justify-end">
              <div className="hidden lg:block">
                <p className="text-muted-foreground text-sm">
                  {islastMessageWarning}
                </p>
              </div>
              {isLoading ? (
                <Button
                  size="icon"
                  type="submit"
                  className="rounded-full"
                  disabled={isLastMessage}
                  onClick={(e) => {
                    e.preventDefault();
                    stop();
                  }}
                >
                  <CircleStop />
                </Button>
              ) : error ? (
                <Button
                  size="icon"
                  type="submit"
                  className="rounded-full"
                  disabled={isLastMessage}
                  onClick={(e) => {
                    e.preventDefault();
                    reload();
                  }}
                >
                  <RotateCw />
                </Button>
              ) : (
                <Button
                  type="submit"
                  size="icon"
                  disabled={isLastMessage || isLoading}
                  className="rounded-full"
                  onClick={(e) => {
                    e.preventDefault();
                    submitForm(e);
                  }}
                >
                  <ArrowUp />
                </Button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
