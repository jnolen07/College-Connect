import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Plus, Send, Sparkles } from "lucide-react";
import { supabase } from "../supabaseClient";
import { T, display, mono } from "../theme";
import { Avatar, PrimaryButton, SectionHeader, SelectField, Tag, TextAreaField, TextField } from "../components/ui";
import { Modal } from "../components/Modal";
import { GROUP_TAGS } from "../data/constants";
import { colorFor, initialsOf } from "../lib/profile";
import { slugify } from "../lib/slug";
import { Internships } from "./Internships";
import { StudyBuddies } from "./StudyBuddies";

export function Groups({ profile, pendingOpenGroupId, onConsumePendingOpen }) {
  const [groups, setGroups] = useState([]);
  const [memberCounts, setMemberCounts] = useState({});
  const [joined, setJoined] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState(null);
  const [showCreate, setShowCreate] = useState(false);

  const load = async () => {
    const [groupsRes, membersRes] = await Promise.all([
      supabase.from("groups").select("*").order("created_at", { ascending: true }),
      supabase.from("group_members").select("group_id, profile_id"),
    ]);
    if (groupsRes.error) console.error("Groups fetch failed:", groupsRes.error.message);
    if (membersRes.error) console.error("Group membership fetch failed:", membersRes.error.message);
    setGroups(groupsRes.data || []);
    const counts = {};
    const mine = new Set();
    for (const row of membersRes.data || []) {
      counts[row.group_id] = (counts[row.group_id] || 0) + 1;
      if (row.profile_id === profile.id) mine.add(row.group_id);
    }
    setMemberCounts(counts);
    setJoined(mine);
    setLoading(false);
  };

  useEffect(() => { load(); }, [profile.id]);

  useEffect(() => {
    if (pendingOpenGroupId) {
      setOpenId(pendingOpenGroupId);
      onConsumePendingOpen();
    }
  }, [pendingOpenGroupId]);

  const toggle = async (id) => {
    const isJoined = joined.has(id);
    setJoined((prev) => { const n = new Set(prev); isJoined ? n.delete(id) : n.add(id); return n; });
    setMemberCounts((prev) => ({ ...prev, [id]: (prev[id] || 0) + (isJoined ? -1 : 1) }));
    if (isJoined) {
      const { error } = await supabase.from("group_members").delete().eq("group_id", id).eq("profile_id", profile.id);
      if (error) console.error("Leave group failed:", error.message);
    } else {
      const { error } = await supabase.from("group_members").insert({ group_id: id, profile_id: profile.id });
      if (error) console.error("Join group failed:", error.message);
    }
  };

  const openGroup = groups.find((g) => g.id === openId);
  if (openGroup) {
    return (
      <GroupDetail
        group={openGroup}
        memberCount={memberCounts[openGroup.id] || 0}
        joined={joined.has(openGroup.id)}
        onToggleJoin={() => toggle(openGroup.id)}
        onBack={() => setOpenId(null)}
        profile={profile}
      />
    );
  }

  return (
    <div>
      <SectionHeader
        eyebrow="Shared interests"
        title="Groups"
        action={
          <PrimaryButton onClick={() => setShowCreate(true)} className="flex items-center gap-1.5 py-2">
            <Plus size={15} /> Create group
          </PrimaryButton>
        }
      />
      {loading && <p style={{ color: T.muted }} className="text-sm">Loading groups...</p>}
      <div className="space-y-3">
        {groups.map((g) => {
          const match = (g.related_interests || []).filter((i) => profile.interests.includes(i));
          return (
            <button
              key={g.id} onClick={() => setOpenId(g.id)}
              style={{ background: T.surface, border: `1px solid ${T.border}` }}
              className="w-full text-left rounded-lg p-5 flex items-center justify-between gap-4 hover:border-[#FF9F45] transition-colors"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span style={{ ...display, color: T.text }} className="font-semibold">{g.name}</span>
                  <Tag tone="cool">{g.tag}</Tag>
                  {match.length > 0 && <Tag tone="warm">Matches {match[0]}</Tag>}
                </div>
                <p style={{ color: "#C6C9D4" }} className="text-sm mb-1">{g.description}</p>
                <span style={{ ...mono, color: T.muted }} className="text-[11px]">{memberCounts[g.id] || 0} members</span>
              </div>
              <div className="shrink-0 flex items-center gap-2">
                {joined.has(g.id)
                  ? <span style={{ background: T.surface2, color: T.muted }} className="text-sm font-medium px-4 py-2 rounded-md">Joined</span>
                  : <span style={{ background: T.warm, color: "#0A0C11" }} className="text-sm font-semibold px-4 py-2 rounded-md">Join</span>}
                <ChevronRight size={16} color={T.muted} />
              </div>
            </button>
          );
        })}
      </div>

      {showCreate && (
        <CreateGroupModal
          profile={profile}
          onClose={() => setShowCreate(false)}
          onCreated={() => { setShowCreate(false); load(); }}
        />
      )}
    </div>
  );
}

function CreateGroupModal({ profile, onClose, onCreated }) {
  const [name, setName] = useState("");
  const [tag, setTag] = useState(GROUP_TAGS[0]);
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const valid = name.trim() && description.trim();

  const submit = async () => {
    if (!valid || saving) return;
    setSaving(true);
    setError(null);
    const { error } = await supabase.from("groups").insert({
      id: slugify(name),
      name: name.trim(),
      tag,
      description: description.trim(),
      type: "discussion",
      created_by: profile.id,
    });
    setSaving(false);
    if (error) { setError("Couldn't create that group — try again."); console.error(error); return; }
    onCreated();
  };

  return (
    <Modal title="Create a group" onClose={onClose}>
      <div className="space-y-4">
        <TextField label="Name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Intramural Volleyball" />
        <SelectField label="Category" value={tag} onChange={(e) => setTag(e.target.value)}>
          {GROUP_TAGS.map((t) => <option key={t} value={t}>{t}</option>)}
        </SelectField>
        <TextAreaField label="Description" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What's this group about?" />
        {error && <p style={{ color: "#F45B69" }} className="text-xs">{error}</p>}
        <PrimaryButton onClick={submit} disabled={!valid || saving} className="w-full py-2.5">
          {saving ? "Creating..." : "Create group"}
        </PrimaryButton>
      </div>
    </Modal>
  );
}

function GroupDetail({ group, memberCount, joined, onToggleJoin, onBack, profile }) {
  const [posts, setPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [draft, setDraft] = useState("");
  const match = (group.related_interests || []).filter((i) => profile.interests.includes(i));

  const loadPosts = async () => {
    const { data, error } = await supabase
      .from("group_posts")
      .select("*")
      .eq("group_id", group.id)
      .order("created_at", { ascending: false });
    if (!error) setPosts(data || []);
    else console.error("Post fetch failed:", error.message);
    setLoadingPosts(false);
  };

  useEffect(() => {
    if (group.type !== "discussion") return;
    loadPosts();

    // Live-append new posts from other members instead of waiting on a manual refresh.
    const channel = supabase
      .channel(`group-posts-${group.id}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "group_posts", filter: `group_id=eq.${group.id}` },
        (payload) => {
          setPosts((prev) => (prev.some((p) => p.id === payload.new.id) ? prev : [payload.new, ...prev]));
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [group.id]);

  const post = async () => {
    if (!draft.trim()) return;
    const text = draft.trim();
    setDraft("");
    const { error } = await supabase.from("group_posts").insert({
      group_id: group.id, author_id: profile.id, author_name: profile.name, text,
    });
    if (error) console.error("Post failed:", error.message);
  };

  return (
    <div>
      <button onClick={onBack} style={{ color: T.muted }} className="flex items-center gap-1.5 text-sm mb-5 hover:text-[#F2F1EC] transition-colors">
        <ChevronLeft size={15} /> Back to groups
      </button>

      <div style={{ background: T.surface, border: `1px solid ${T.border}` }} className="rounded-lg p-5 mb-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span style={{ ...display, color: T.text }} className="text-xl font-semibold">{group.name}</span>
              <Tag tone="cool">{group.tag}</Tag>
            </div>
            <p style={{ color: "#C6C9D4" }} className="text-sm mb-1">{group.description}</p>
            <span style={{ ...mono, color: T.muted }} className="text-[11px]">{memberCount} members</span>
            {match.length > 0 && (
              <div style={{ color: T.warm }} className="text-xs mt-2 flex items-center gap-1">
                <Sparkles size={12} /> You both share an interest in {match.join(", ")}
              </div>
            )}
          </div>
          {joined
            ? <button onClick={onToggleJoin} style={{ background: T.surface2, color: T.muted }} className="shrink-0 text-sm font-medium px-4 py-2 rounded-md">Joined</button>
            : <PrimaryButton onClick={onToggleJoin} className="shrink-0 py-2">Join</PrimaryButton>}
        </div>
      </div>

      {group.type === "board-internships" && <Internships profile={profile} embedded />}
      {group.type === "board-study" && <StudyBuddies profile={profile} embedded />}

      {group.type === "discussion" && (
        <div>
          <div style={{ background: T.surface, border: `1px solid ${T.border}` }} className="rounded-lg p-3 flex gap-2 mb-4">
            <input
              value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => e.key === "Enter" && post()}
              placeholder="Share something with the group..."
              style={{ background: T.bg, border: `1px solid ${T.border}`, color: T.text }}
              className="flex-1 text-sm px-3 py-2 rounded-md outline-none focus:border-[#FF9F45] placeholder:text-[#5B5F6E]"
            />
            <button onClick={post} style={{ background: T.warm }} className="px-3 py-2 rounded-md hover:brightness-110">
              <Send size={16} color="#0A0C11" />
            </button>
          </div>
          <div className="space-y-3">
            {loadingPosts && <p style={{ color: T.muted }} className="text-sm">Loading posts...</p>}
            {!loadingPosts && posts.length === 0 && <p style={{ color: T.muted }} className="text-sm">No posts yet — be the first to say something.</p>}
            {posts.map((p) => (
              <div key={p.id} style={{ background: T.surface, border: `1px solid ${T.border}` }} className="rounded-lg p-4 flex gap-3">
                <Avatar initials={initialsOf(p.author_name)} color={colorFor(p.author_id)} size={34} />
                <div className="min-w-0">
                  <div className="flex items-baseline gap-2 mb-0.5">
                    <span style={{ ...display, color: T.text }} className="text-sm font-semibold">{p.author_name}</span>
                    <span style={{ color: T.muted }} className="text-[11px]">{new Date(p.created_at).toLocaleString()}</span>
                  </div>
                  <p style={{ color: "#C6C9D4" }} className="text-sm leading-relaxed">{p.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
