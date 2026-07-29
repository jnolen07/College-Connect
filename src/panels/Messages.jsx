import { useEffect, useRef, useState } from "react";
import { Send } from "lucide-react";
import { supabase } from "../supabaseClient";
import { T, display } from "../theme";
import { Avatar, SectionHeader } from "../components/ui";
import { colorFor, initialsOf } from "../lib/profile";

export function Messages({ profile, pendingChatWith, onConsumePending }) {
  const [conversations, setConversations] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [thread, setThread] = useState([]);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(true);
  const activeIdRef = useRef(null);

  useEffect(() => { activeIdRef.current = activeId; }, [activeId]);

  const loadConversations = async () => {
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .or(`sender_id.eq.${profile.id},recipient_id.eq.${profile.id}`)
      .order("created_at", { ascending: false });
    if (error) { console.error("Conversation fetch failed:", error.message); setLoading(false); return; }

    const byOther = new Map();
    for (const m of data || []) {
      const otherId = m.sender_id === profile.id ? m.recipient_id : m.sender_id;
      if (!byOther.has(otherId)) byOther.set(otherId, m);
    }
    const otherIds = Array.from(byOther.keys());
    let names = {};
    if (otherIds.length > 0) {
      const { data: people } = await supabase.from("profiles").select("id,name").in("id", otherIds);
      names = Object.fromEntries((people || []).map((p) => [p.id, p.name]));
    }
    const list = otherIds.map((id) => ({
      id, name: names[id] || "Unknown", last: byOther.get(id).text, time: new Date(byOther.get(id).created_at).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }),
    }));
    setConversations(list);
    setLoading(false);
  };

  const loadThread = async (otherId) => {
    if (!otherId) return;
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .or(`and(sender_id.eq.${profile.id},recipient_id.eq.${otherId}),and(sender_id.eq.${otherId},recipient_id.eq.${profile.id})`)
      .order("created_at", { ascending: true });
    if (!error) setThread(data || []);
    else console.error("Thread fetch failed:", error.message);
  };

  useEffect(() => { loadConversations(); }, [profile.id]);

  useEffect(() => {
    if (pendingChatWith) {
      setActiveId(pendingChatWith.id);
      setConversations((prev) => prev.some((c) => c.id === pendingChatWith.id)
        ? prev
        : [{ id: pendingChatWith.id, name: pendingChatWith.name, last: "Say hi!", time: "" }, ...prev]);
      onConsumePending();
    }
  }, [pendingChatWith]);

  useEffect(() => {
    if (activeId) loadThread(activeId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeId]);

  // Real-time inbox: new messages land instantly instead of waiting on a poll.
  useEffect(() => {
    const channel = supabase
      .channel(`inbox-${profile.id}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `recipient_id=eq.${profile.id}` },
        (payload) => {
          const m = payload.new;
          if (activeIdRef.current === m.sender_id) {
            setThread((prev) => (prev.some((x) => x.id === m.id) ? prev : [...prev, m]));
          }
          loadConversations();
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile.id]);

  const send = async () => {
    if (!draft.trim() || !activeId) return;
    const text = draft.trim();
    setDraft("");
    const { error } = await supabase.from("messages").insert({ sender_id: profile.id, recipient_id: activeId, text });
    if (error) { console.error("Send failed:", error.message); return; }
    await loadThread(activeId);
    await loadConversations();
  };

  const active = conversations.find((c) => c.id === activeId);

  return (
    <div>
      <SectionHeader eyebrow="Stay in touch" title="Messages" />
      <div style={{ background: T.surface, border: `1px solid ${T.border}` }} className="rounded-lg overflow-hidden flex flex-col md:flex-row h-[520px]">
        <div style={{ borderColor: T.border }} className="md:w-72 border-b md:border-b-0 md:border-r overflow-y-auto">
          {loading && <p style={{ color: T.muted }} className="text-sm p-4">Loading...</p>}
          {!loading && conversations.length === 0 && (
            <p style={{ color: T.muted }} className="text-sm p-4">No conversations yet — tap Connect on someone in Discover to say hi.</p>
          )}
          {conversations.map((t) => (
            <button
              key={t.id} onClick={() => setActiveId(t.id)}
              style={{ background: activeId === t.id ? T.surface2 : "transparent", borderColor: T.border }}
              className="w-full text-left px-4 py-3 flex gap-3 items-center border-b hover:brightness-110"
            >
              <Avatar initials={initialsOf(t.name)} color={colorFor(t.id)} size={36} />
              <div className="min-w-0 flex-1">
                <div className="flex justify-between items-baseline">
                  <span style={{ ...display, color: T.text }} className="text-sm font-semibold truncate">{t.name}</span>
                  <span style={{ color: T.muted }} className="text-[10px] shrink-0 ml-1">{t.time}</span>
                </div>
                <div style={{ color: T.muted }} className="text-xs truncate">{t.last}</div>
              </div>
            </button>
          ))}
        </div>
        <div className="flex-1 flex flex-col min-h-0">
          {!active ? (
            <div className="flex-1 flex items-center justify-center px-6">
              <p style={{ color: T.muted }} className="text-sm text-center">Pick a conversation, or connect with someone new from Discover.</p>
            </div>
          ) : (
            <>
              <div style={{ borderColor: T.border }} className="px-5 py-3 border-b flex items-center gap-3">
                <Avatar initials={initialsOf(active.name)} color={colorFor(active.id)} size={32} />
                <span style={{ ...display, color: T.text }} className="font-semibold text-sm">{active.name}</span>
              </div>
              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
                {thread.length === 0 && <p style={{ color: T.muted }} className="text-sm">Say hi to start the conversation.</p>}
                {thread.map((m) => (
                  <div key={m.id} className={`flex ${m.sender_id === profile.id ? "justify-end" : "justify-start"}`}>
                    <div
                      style={{ background: m.sender_id === profile.id ? T.warm : T.surface2, color: m.sender_id === profile.id ? "#0A0C11" : T.text }}
                      className="max-w-[70%] px-3 py-2 rounded-lg text-sm"
                    >
                      {m.text}
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ borderColor: T.border }} className="p-3 border-t flex gap-2">
                <input
                  value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()}
                  placeholder="Write a message..."
                  style={{ background: T.bg, border: `1px solid ${T.border}`, color: T.text }}
                  className="flex-1 text-sm px-3 py-2 rounded-md outline-none focus:border-[#FF9F45] placeholder:text-[#5B5F6E]"
                />
                <button onClick={send} style={{ background: T.warm }} className="px-3 py-2 rounded-md hover:brightness-110">
                  <Send size={16} color="#0A0C11" />
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
