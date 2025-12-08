"use client";
import { useRef, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import DisplayEmail from "@/components/my_ui/EmailList"

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
function renderMessageContent(content: any) {
    // If it's a plain string
    if (typeof content === "string") return content;

    // If it's an array of message chunks
    if (Array.isArray(content)) {
        return content.map((chunk: any, i: number) => (
            <p key={i}>{chunk.text || JSON.stringify(chunk)}</p>
        ));
    }

    // If it's an object with text field
    if (content?.text) return content.text;

    // Fallback
    return JSON.stringify(content);
}

type Snippet_Subject_Date = {
    id: string;
    subject: string;
    date: string;
    snippet: string;
};

export default function ChatUI() {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    const [isGenerating, setIsGenerating] = useState(false);
    const [query, setQuery] = useState("");
    const [threadId, setThreadId] = useState<string>(generateThreadId());
    const [BotMsg, setBotMsg] = useState<{ from: string, content: any }[]>([]);
    const [ToolMsg, setToolMsg] = useState<{
        from: string;
        content: Snippet_Subject_Date[];
        totalEmail: number;
    }[]>([]);
    const [savedIds, setSavedIds] = useState<string[]>([]);
    const [toBeRemovedIds, setToBeRemovedIds] = useState<string[]>([]);

    const chatEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [BotMsg]);

    const handleSave = (id: string) => {
        setSavedIds(prev => [...prev, id]);
        setToBeRemovedIds(prev => prev.filter(x => x !== id));

        setToolMsg(prev =>
            prev.map(msg => {
                const newContent = msg.content.filter(e => e.id !== id);
                return {
                    ...msg,
                    content: newContent,
                    totalEmail: newContent.length 
                };
            })
        );
    };

    const handleGenerate = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!query.trim()) return;

        setIsGenerating(true);
        const formData = new FormData();
        formData.append("query", query);
        formData.append("config", threadId);

        try {
            const queryResponse = await fetch(`${backendUrl}/agent/llm`, {
                method: "POST",
                credentials: "include",
                body: formData,
            });

            const data = await queryResponse.json();
            setQuery("");

            if (data.from === "AI") {
                setBotMsg((prev) => [...prev, { from: data.from, content: data.content }]);
                setToolMsg([]);
            }

            if (data.from === "Tool") {
                setToolMsg([{ from: data.from, content: data.snippet_subject_date, totalEmail: data.totalEmail }]);
                setToBeRemovedIds(data.snippet_subject_date.map((e: any) => e.id));
                setSavedIds([]);

                // setBotMsg([]);

                setThreadId(generateThreadId());
            }


        } catch (error) {
            setBotMsg((prev) => [
                ...prev,
                {
                    from: "System",
                    content: String(error) + ". Refresh the site."
                }
            ]);
            setToolMsg([]);
            setThreadId(generateThreadId());

        } finally {
            setIsGenerating(false);
        }
    };

    console.log(savedIds)
    console.log(toBeRemovedIds)
    return (
        <div className="chat-container flex flex-col w-full max-w-5xl mx-auto space-y-4">
            <div className="flex flex-col space-y-2 border p-4 rounded-lg max-h-[50vh] overflow-y-auto bg-gray-50 border-black dark:bg-gray-800 dark:border-gray-500">


                {ToolMsg.length === 0 ? (

                    <>
                        {BotMsg.map((message, idx) => (
                            <div key={idx} className="p-2 rounded">
                                <div className="space-y-1">
                                    {renderMessageContent(message.content)}
                                    <hr className="mt-0.5 dark:bg-gray-500" />
                                </div>
                            </div>
                        ))}
                    </>
                ) : (

                    <>
                        <div className="flex justify-end mb-2">
                            <button
                                className="text-sm bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 cursor-pointer"
                                onClick={() => console.log("you will handle this")}
                            >
                                Delete All
                            </button>
                        </div>

                        {ToolMsg.map((message) => (
                            <div key={message.totalEmail}>

                                <div className="mb-2">
                                    <p className="text-m font-semibold text-red-800 dark:text-red-500">
                                        Total Emails Found: {message.totalEmail}
                                    </p>
                                </div>

                                {message.content.map((e) => (
                                    <DisplayEmail
                                        key={e.id}
                                        id={e.id}
                                        subject={e.subject}
                                        date={e.date}
                                        snippet={e.snippet}
                                        onSave={handleSave}
                                    />

                                ))}

                            </div>
                        ))}
                    </>

                )}
                <div ref={chatEndRef} />

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
                            if (isGenerating == false) {
                                handleGenerate(e);
                            }
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
