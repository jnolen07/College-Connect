import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { supabase } from "../supabaseClient";
import { T, display, mono } from "../theme";
import { PrimaryButton, SectionHeader, SelectField, Tag, TextField } from "../components/ui";
import { Modal } from "../components/Modal";
import { INTERNSHIP_TAGS } from "../data/constants";

export function Internships({ profile, embedded = false }) {
  const [internships, setInternships] = useState([]);
  const [saved, setSaved] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const load = async () => {
    const [listRes, savedRes] = await Promise.all([
      supabase.from("internships").select("*").order("created_at", { ascending: false }),
      supabase.from("saved_internships").select("internship_id").eq("profile_id", profile.id),
    ]);
    if (listRes.error) console.error("Internships fetch failed:", listRes.error.message);
    if (savedRes.error) console.error("Saved internships fetch failed:", savedRes.error.message);
    setInternships(listRes.data || []);
    setSaved(new Set((savedRes.data || []).map((r) => r.internship_id)));
    setLoading(false);
  };

  useEffect(() => { load(); }, [profile.id]);

  const toggleSave = async (id) => {
    const isSaved = saved.has(id);
    setSaved((prev) => { const n = new Set(prev); isSaved ? n.delete(id) : n.add(id); return n; });
    if (isSaved) {
      const { error } = await supabase.from("saved_internships").delete().eq("internship_id", id).eq("profile_id", profile.id);
      if (error) console.error("Unsave failed:", error.message);
    } else {
      const { error } = await supabase.from("saved_internships").insert({ internship_id: id, profile_id: profile.id });
      if (error) console.error("Save failed:", error.message);
    }
  };

  const postButton = (
    <PrimaryButton onClick={() => setShowModal(true)} className="flex items-center gap-1.5 py-2">
      <Plus size={15} /> Post a listing
    </PrimaryButton>
  );

  return (
    <div>
      {!embedded && <SectionHeader eyebrow="Work & internships" title="Internship board" action={postButton} />}
      {embedded && <div className="flex justify-end mb-4">{postButton}</div>}

      {loading && <p style={{ color: T.muted }} className="text-sm">Loading listings...</p>}
      {!loading && internships.length === 0 && (
        <p style={{ color: T.muted }} className="text-sm">No listings yet — be the first to post one.</p>
      )}
      <div className="space-y-3">
        {internships.map((job) => (
          <div key={job.id} style={{ background: T.surface, border: `1px solid ${T.border}` }} className="rounded-lg p-5 flex items-center justify-between gap-4 flex-wrap">
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span style={{ ...display, color: T.text }} className="font-semibold">{job.role}</span>
                <Tag tone="warm">{job.tag}</Tag>
              </div>
              <div style={{ color: "#C6C9D4" }} className="text-sm mb-1">{job.org} · {job.location} · {job.term}</div>
              <span style={{ ...mono, color: T.muted }} className="text-[11px]">Posted by {job.posted_by_name}</span>
            </div>
            <button
              onClick={() => toggleSave(job.id)}
              style={{
                background: saved.has(job.id) ? T.surface2 : "transparent",
                color: saved.has(job.id) ? T.muted : T.cool,
                border: `1px solid ${saved.has(job.id) ? T.border : T.cool}`,
              }}
              className="shrink-0 text-sm font-medium px-4 py-2 rounded-md transition-colors"
            >
              {saved.has(job.id) ? "Saved" : "Save"}
            </button>
          </div>
        ))}
      </div>

      {showModal && (
        <PostInternshipModal
          profile={profile}
          onClose={() => setShowModal(false)}
          onPosted={() => { setShowModal(false); load(); }}
        />
      )}
    </div>
  );
}

function PostInternshipModal({ profile, onClose, onPosted }) {
  const [role, setRole] = useState("");
  const [org, setOrg] = useState("");
  const [location, setLocation] = useState("");
  const [term, setTerm] = useState("");
  const [tag, setTag] = useState(INTERNSHIP_TAGS[0]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const valid = role.trim() && org.trim() && location.trim() && term.trim();

  const submit = async () => {
    if (!valid || saving) return;
    setSaving(true);
    setError(null);
    const { error } = await supabase.from("internships").insert({
      role: role.trim(), org: org.trim(), location: location.trim(), term: term.trim(), tag,
      posted_by: profile.id, posted_by_name: profile.name,
    });
    setSaving(false);
    if (error) { setError("Couldn't post that listing — try again."); console.error(error); return; }
    onPosted();
  };

  return (
    <Modal title="Post a listing" onClose={onClose}>
      <div className="space-y-4">
        <TextField label="Role" value={role} onChange={(e) => setRole(e.target.value)} placeholder="e.g. Software Engineering Intern" />
        <TextField label="Organization" value={org} onChange={(e) => setOrg(e.target.value)} placeholder="e.g. Fieldstone Analytics" />
        <div className="grid grid-cols-2 gap-3">
          <TextField label="Location" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Remote / City, State" />
          <TextField label="Term" value={term} onChange={(e) => setTerm(e.target.value)} placeholder="e.g. Summer '27" />
        </div>
        <SelectField label="Category" value={tag} onChange={(e) => setTag(e.target.value)}>
          {INTERNSHIP_TAGS.map((t) => <option key={t} value={t}>{t}</option>)}
        </SelectField>
        {error && <p style={{ color: "#F45B69" }} className="text-xs">{error}</p>}
        <PrimaryButton onClick={submit} disabled={!valid || saving} className="w-full py-2.5">
          {saving ? "Posting..." : "Post listing"}
        </PrimaryButton>
      </div>
    </Modal>
  );
}
