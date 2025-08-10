// FILE: components/chat-interface.tsx
"use client"
import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SendHorizonal, X } from "lucide-react";

interface Message { role: 'user' | 'assistant'; content: string; }
interface Persona { id: string; name: string; avatar?: string; [key: string]: any; }
interface ChatInterfaceProps { persona: Persona; onClose: () => void; }

export function ChatInterface({ persona, onClose }: ChatInterfaceProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [userInput, setUserInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const scrollAreaRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        scrollAreaRef.current?.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: 'smooth' });
    }, [messages]);

    const handleSend = async () => {
        if (!userInput.trim()) return;
        const newMessages: Message[] = [...messages, { role: 'user', content: userInput }];
        setMessages(newMessages);
        const messageToSend = userInput;
        setUserInput("");
        setIsLoading(true);
        try {
            const response = await fetch("http://localhost:8000/api/personas/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ persona, message: messageToSend }),
            });
            if (!response.ok) throw new Error("API Error");
            const result = await response.json();
            setMessages(current => [...current, { role: 'assistant', content: result.reply }]);
        } catch (error) {
            setMessages(current => [...current, { role: 'assistant', content: "Sorry, I had an issue responding." }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative w-full max-w-lg h-[80vh] bg-white rounded-xl shadow-2xl flex flex-col">
                <div className="flex items-center justify-between p-4 border-b">
                    <div className="flex items-center gap-3"><Avatar><AvatarImage src={persona.avatar} /><AvatarFallback>{persona.name?.charAt(0)}</AvatarFallback></Avatar><h2 className="font-semibold text-lg">Chat with {persona.name}</h2></div>
                    <Button variant="ghost" size="icon" onClick={onClose}><X className="h-5 w-5" /></Button>
                </div>
                <ScrollArea className="flex-grow p-4"><div className="space-y-4" ref={scrollAreaRef}>{messages.map((msg, i) => (<div key={i} className={`flex items-end gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}><div className={`rounded-2xl px-4 py-2 max-w-[80%] ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-br-none' : 'bg-gray-200 rounded-bl-none'}`}><p className="text-sm">{msg.content}</p></div></div>))
                }{isLoading && <div className="flex items-end gap-2"><div className="rounded-2xl px-4 py-2 bg-gray-200"><div className="flex items-center gap-1"><span className="h-2 w-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span><span className="h-2 w-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span><span className="h-2 w-2 bg-gray-400 rounded-full animate-bounce"></span></div></div></div>}</div></ScrollArea>
                <div className="p-4 border-t bg-gray-50"><div className="relative"><Input placeholder={`Message ${persona.name}...`} value={userInput} onChange={e => setUserInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && !isLoading && handleSend()} disabled={isLoading} className="pr-12" /><Button size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8" onClick={handleSend} disabled={isLoading}><SendHorizonal className="h-4 w-4" /></Button></div></div>
            </motion.div>
        </div>
    );
}