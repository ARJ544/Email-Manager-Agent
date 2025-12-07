"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";

function generateThreadId(length = 20) {
    const charset = "abcdefghijklmnopqrstuvwxyz0123456789-";
    let result = "";
    const randomValues = new Uint32Array(length);
    window.crypto.getRandomValues(randomValues);
    for (let i = 0; i < length; i++) {
        result += charset[randomValues[i] % charset.length];
    }
    return result;
}


interface ToolEmail {
    id: string;
    threadId: string;
}

interface ToolContent {
    messages: ToolEmail[];
    resultSizeEstimate: number;
}

interface BotMessage {
    type: "ai" | "tool";
    content: string | ToolContent;
}

export default function ChatUI() {
    const [isGenerating, setIsGenerating] = useState(false);
    const [query, setQuery] = useState("");
    const [threadId, setThreadId] = useState<string>(generateThreadId());
    const [BotMsg, setBotMsg] = useState<{from :string , content: string }[]>([]);
    const [ToolMsg, setToolMsg] = useState<{from :string , content: string, totalEmail: string }[]>([]);
    

    const handleGenerate = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!query.trim()) return;

        setIsGenerating(true);
        const formData = new FormData();
        formData.append("query", query);
        formData.append("config", threadId);
        setQuery("");


        try {
            const queryResponse = await fetch("http://localhost:8000/agent/llm", {
                method: "POST",
                credentials: "include",
                body: formData,
            });

            const data = await queryResponse.json();

            if (data.from === "AI") {
                setBotMsg((prev) => [...prev, {from: data.from, content: data.content }]);
            }

            if (data.from === "Tool") {
                setToolMsg((prev) => [...prev, {from: data.from, content: data.content, totalEmail: data.totalEmail }]);
                setThreadId(generateThreadId());
                // console.log(ToolMsg.)
            }


        } catch (error) {
            setBotMsg((prev) => [
                ...prev,
                {
                    from: "System",
                    content: String(error) + ". Refresh the site."
                }
            ]);
            setThreadId(generateThreadId());

        } finally {
            setIsGenerating(false);
        }
    };


    return (
        <div className="flex flex-col w-full max-w-xl mx-auto space-y-4">
            <div className="flex flex-col space-y-2 border p-4 rounded-lg max-h-[50vh] overflow-y-auto">
                {BotMsg.map((message, idx) => (
                    <div
                        key={idx}
                        className={` p-2 rounded`}
                    >
                        <div className="space-y-1">
                            {message.content}
                            <hr className="mt-0.5 dark:bg-gray-500" />
                        </div>
                    </div>
                ))}
                {ToolMsg.map((message, idx) => (
                    <div
                        key={idx}
                        className={` p-2 rounded`}
                    >
                        <div className="space-y-1">
                            {message.content}
                            {message.totalEmail}
                        </div>
                    </div>
                ))}
            </div>

            <form onSubmit={handleGenerate} className="flex gap-2 items-center">
                <textarea
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Start typing..."
                    className="flex-1 rounded-2xl border-2 border-gray-400 dark:bg-neutral-800 dark:border-gray-600 resize-none p-4 max-h-30 overflow-y-auto"
                    onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            handleGenerate(e);
                        }
                    }}
                    onInput={(e) => {
                        const target = e.target as HTMLTextAreaElement;
                        target.style.height = "auto";
                        target.style.height = target.scrollHeight + "px";
                    }}
                />
                <Button type="submit" disabled={isGenerating}>
                    {isGenerating ? "Sending..." : "Send"}
                </Button>
            </form>
        </div>
    );
}
