import { useEffect, useState } from "react";
import { Clock, Plus } from "lucide-react";
import { supabase } from "../supabaseClient";
import { T, display, mono } from "../theme";
import { PrimaryButton, SectionHeader, Tag, TextAreaField, TextField } from "../components/ui";
import { Modal } from "../components/Modal";

export function StudyBuddies({ profile, embedded = false }) {
  const [requests, setRequests] = useState([]);
  const [memberCounts, setMemberCounts] = useState({});
  const [joined, setJoined] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const load = async () => {
    const [listRes, membersRes] = await Promise.all([
      supabase.from("study_requests").select("*").order("created_at", { ascending: false }),
      supabase.from("study_request_members").select("request_id, profile_id"),
    ]);
    if (listRes.error) console.error("Study requests fetch failed:", listRes.error.message);
    if (membersRes.error) console.error("Study request members fetch failed:", membersRes.error.message);
    setRequests(listRes.data || []);
    const counts = {};
    const mine = new Set();
    for (const row of membersRes.data || []) {
      counts[row.request_id] = (counts[row.request_id] || 0) + 1;
      if (row.profile_id === profile.id) mine.add(row.request_id);
    }
    setMemberCounts(counts);
    setJoined(mine);
    setLoading(false);
  };

  useEffect(() => { load(); }, [profile.id]);

  const toggleJoin = async (id) => {
    const isJoined = joined.has(id);
    setJoined((prev) => { const n = new Set(prev); isJoined ? n.delete(id) : n.add(id); return n; });
    setMemberCounts((prev) => ({ ...prev, [id]: (prev[id] || 0) + (isJoined ? -1 : 1) }));
    if (isJoined) {
      const { error } = await supabase.from("study_request_members").delete().eq("request_id", id).eq("profile_id", profile.id);
      if (error) console.error("Leave study request failed:", error.message);
    } else {
      const { error } = await supabase.from("study_request_members").insert({ request_id: id, profile_id: profile.id });
      if (error) console.error("Join study request failed:", error.message);
    }
  };

  const postButton = (
    <PrimaryButton onClick={() => setShowModal(true)} className="flex items-center gap-1.5 py-2">
      <Plus size={15} /> Post a request
    </PrimaryButton>
  );

  return (
    <div>
      {!embedded && <SectionHeader eyebrow="Find a study pod" title="Study buddies" action={postButton} />}
      {embedded && <div className="flex justify-end mb-4">{postButton}</div>}

      {loading && <p style={{ color: T.muted }} className="text-sm">Loading requests...</p>}
      {!loading && requests.length === 0 && (
        <p style={{ color: T.muted }} className="text-sm">No requests yet — post one to find a study partner.</p>
      )}
      <div className="space-y-3">
        {requests.map((r) => (
          <div key={r.id} style={{ background: T.surface, border: `1px solid ${T.border}` }} className="rounded-lg p-5">
            <div className="flex items-center justify-between mb-2 gap-2 flex-wrap">
              <span style={{ ...display, color: T.text }} className="font-semibold">{r.course}</span>
              <Tag>{r.school}</Tag>
            </div>
            {r.note && <p style={{ color: "#C6C9D4" }} className="text-sm mb-3">{r.note}</p>}
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <span style={{ ...mono, color: T.muted }} className="text-[11px] flex items-center gap-1">
                <Clock size={11} /> {r.when_text} · posted by {r.posted_by_name} · {memberCounts[r.id] || 0} joined
              </span>
              {joined.has(r.id)
                ? <button onClick={() => toggleJoin(r.id)} style={{ background: T.surface2, color: T.muted }} className="text-sm font-medium px-4 py-1.5 rounded-md">Joined</button>
                : <PrimaryButton onClick={() => toggleJoin(r.id)} className="px-4 py-1.5">Join</PrimaryButton>}
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <PostStudyRequestModal
          profile={profile}
          onClose={() => setShowModal(false)}
          onPosted={() => { setShowModal(false); load(); }}
        />
      )}
    </div>
  );
}

function PostStudyRequestModal({ profile, onClose, onPosted }) {
  const [course, setCourse] = useState("");
  const [school, setSchool] = useState(profile.school || "");
  const [whenText, setWhenText] = useState("");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const valid = course.trim() && school.trim() && whenText.trim();

  const submit = async () => {
    if (!valid || saving) return;
    setSaving(true);
    setError(null);
    const { error } = await supabase.from("study_requests").insert({
      course: course.trim(), school: school.trim(), when_text: whenText.trim(), note: note.trim() || null,
      posted_by: profile.id, posted_by_name: profile.name,
    });
    setSaving(false);
    if (error) { setError("Couldn't post that request — try again."); console.error(error); return; }
    onPosted();
  };

  return (
    <Modal title="Post a study request" onClose={onClose}>
      <div className="space-y-4">
        <TextField label="Course" value={course} onChange={(e) => setCourse(e.target.value)} placeholder="e.g. CS 61B — Data Structures" />
        <TextField label="School" value={school} onChange={(e) => setSchool(e.target.value)} placeholder="Your school" />
        <TextField label="When" value={whenText} onChange={(e) => setWhenText(e.target.value)} placeholder="e.g. Weekday mornings" />
        <TextAreaField label="Note (optional)" rows={3} value={note} onChange={(e) => setNote(e.target.value)} placeholder="What are you looking for?" />
        {error && <p style={{ color: "#F45B69" }} className="text-xs">{error}</p>}
        <PrimaryButton onClick={submit} disabled={!valid || saving} className="w-full py-2.5">
          {saving ? "Posting..." : "Post request"}
        </PrimaryButton>
      </div>
    </Modal>
  );
}
