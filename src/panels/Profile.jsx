import { useState } from "react";
import { GraduationCap } from "lucide-react";
import { supabase } from "../supabaseClient";
import { T, mono, display } from "../theme";
import { Avatar, PrimaryButton, SectionHeader, Tag } from "../components/ui";
import { matchSchools } from "../data/schools";

export function Profile({ profile, onUpdate }) {
  const [bio, setBio] = useState(profile.bio || "Say something about yourself...");
  const [school, setSchool] = useState(profile.school);
  const [schoolQuery, setSchoolQuery] = useState("");
  const [editing, setEditing] = useState(false);
  const suggestions = matchSchools(schoolQuery);

  const save = async () => {
    const { error } = await supabase.from("profiles").update({ bio, school }).eq("id", profile.id);
    if (error) console.error("Profile update failed:", error.message);
    onUpdate({ ...profile, bio, school });
    setEditing(false);
  };

  return (
    <div>
      <SectionHeader eyebrow="Your card" title="Profile" />
      <div style={{ background: T.surface, border: `1px solid ${T.border}` }} className="rounded-lg p-6 max-w-lg">
        <div className="flex items-center gap-4 mb-5">
          <Avatar initials={profile.name.slice(0, 2).toUpperCase()} color={T.surface2} size={64} image={profile.avatar_url} />
          <div>
            <div style={{ ...display, color: T.text }} className="text-xl font-semibold">{profile.name}</div>
            <div style={{ color: T.muted }} className="text-sm flex items-center gap-1"><GraduationCap size={13} /> {profile.major} · {profile.year}</div>
          </div>
        </div>

        {editing ? (
          <textarea
            value={bio} onChange={(e) => setBio(e.target.value)} rows={3}
            style={{ background: T.bg, border: `1px solid ${T.border}`, color: T.text }}
            className="w-full text-sm px-3 py-2 rounded-md outline-none focus:border-[#FF9F45] mb-4"
          />
        ) : (
          <p style={{ color: "#C6C9D4" }} className="text-sm mb-4 leading-relaxed">{bio}</p>
        )}

        <div className="flex gap-1.5 flex-wrap mb-5">
          {profile.interests.map((i) => <Tag key={i}>{i}</Tag>)}
        </div>

        <div style={{ borderColor: T.border }} className="border-t pt-4">
          {editing ? (
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="relative flex-1 min-w-[180px]">
                <input
                  value={schoolQuery || school}
                  onChange={(e) => { setSchoolQuery(e.target.value); setSchool(e.target.value); }}
                  placeholder="Search your school..."
                  style={{ background: T.bg, border: `1px solid ${T.border}`, color: T.text, ...mono }}
                  className="text-[11px] w-full px-2 py-1.5 rounded-sm outline-none focus:border-[#FF9F45]"
                />
                {suggestions.length > 0 && (
                  <div style={{ background: T.surface2, border: `1px solid ${T.border}` }} className="absolute top-full left-0 right-0 mt-1 rounded-md overflow-hidden z-10">
                    {suggestions.map((s) => (
                      <button
                        key={s} onClick={() => { setSchool(s); setSchoolQuery(""); }}
                        style={{ color: T.text }} className="w-full text-left text-xs px-3 py-2 hover:bg-[#262B38]"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <PrimaryButton onClick={save} className="px-4 py-1.5 shrink-0">Save</PrimaryButton>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <span style={{ ...mono, color: T.muted }} className="text-[11px]">{school} · Age {profile.age}</span>
              <button onClick={() => setEditing(true)} style={{ color: T.cool }} className="text-xs font-medium">Edit</button>
            </div>
          )}
        </div>
      </div>
      <button
        onClick={() => supabase.auth.signOut()}
        style={{ ...mono, color: T.muted }}
        className="md:hidden mt-4 text-[11px] uppercase tracking-wide hover:text-[#F2F1EC] transition-colors"
      >
        Sign out
      </button>
    </div>
  );
}
