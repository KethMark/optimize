"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  BarChart2,
  BookOpen,
  CircleStop,
  Info,
  Send,
  TriangleAlert,
} from "lucide-react";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { useScrollToBottom } from "./ui/scroll-bottom";
import { PreviewMessage, ThinkingMessage } from "./message";
import { useEffect, useRef, useState } from "react";
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
import { Icon } from "./ui/icon";

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
    handleInputChange,
    handleSubmit,
    stop,
    reload,
    error,
    isLoading,
    append,
  } = useChat({
    body: {
      chatId,
    },
    initialMessages: conversation || [],
    onError: (e) => {
      console.error("Error sending message:", e);
    },
  });

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        76
      )}px`;
    }
  }, [input]);

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    handleSubmit(e);
  };

  return (
    <div className="mx-auto flex flex-col no-scrollbar -mt-2">
      <div className="flex justify-between h-[90vh] w-full lg:flex-row flex-col sm:space-y-20 lg:space-y-0 p-2">
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
        <div className="w-full p-4 flex flex-col h-[90vh]">
          <div
            ref={messagesContainerRef}
            className="flex-1 overflow-y-auto mb-4 space-y-4"
          >
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

            {messages.length === 0 && (
              <div className="flex flex-col max-w-lg mx-auto justify-between h-[65vh] lg:h-[75vh] md:h-[68vh]">
                <div className="flex items-center justify-center gap-1 mt-44 lg:mt-60">
                  <Icon.Optimize className="size-12" />
                  <p className="text-xl sm:text-2xl md:text-3xl">optimize</p>
                </div>
                <div className="lg:flex md:flex">
                  {suggestedActions.map((suggestedAction, index) => {
                    const Icon = suggestedAction.icon;
                    return (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.05 * index }}
                        key={index}
                        className={"block"}
                      >
                        <button
                          onClick={async () => {
                            append({
                              role: "user",
                              content: suggestedAction.action,
                            });
                          }}
                        >
                          <span className="flex items-center gap-2 px-5 py-4">
                            <Icon className="stroke-orange-600" />
                            {suggestedAction.title}
                          </span>
                        </button>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            )}

            <div
              ref={messagesEndRef}
              className="shrink-0 min-w-[24px] min-h-[4px]"
            />
          </div>

          {error ? (
            <div className="flex justify-center mb-4">
              <Button onClick={() => reload()}>
                <TriangleAlert className="mr-2 h-4 w-4" />
                Regenerate
              </Button>
            </div>
          ) : (
            <form
              onSubmit={handleFormSubmit}
              className="relative"
              ref={formRef}
            >
              <Textarea
                ref={textareaRef}
                placeholder={messages.length === 0 ? "Ask optimize about your pdf..." : "Ask optimze follow up question..."}
                value={input}
                disabled={isLoading}
                onChange={handleInputChange}
                autoFocus={false}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e as React.KeyboardEvent<HTMLTextAreaElement>);
                  }
                }}
                className="flex-1 pr-16 min-h-[24px] max-h-[72px] overflow-hidden"
                style={{ resize: "none" }}
              />
              <Button
                type="submit"
                className="absolute right-2 top-2"
                variant="ghost"
              >
                {isLoading ? (
                  <CircleStop onClick={() => stop()} className="h-4 w-4 " />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
