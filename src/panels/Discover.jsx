import { useEffect, useState } from "react";
import { MapPin } from "lucide-react";
import { supabase } from "../supabaseClient";
import { T, display, mono } from "../theme";
import { Avatar, FilterPill, PrimaryButton, SectionHeader, Tag } from "../components/ui";
import { codeFor, colorFor, initialsOf } from "../lib/profile";

export function Discover({ profile, onConnect }) {
  const [filter, setFilter] = useState("All");
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .neq("id", profile.id)
        .order("created_at", { ascending: false });
      if (active) {
        if (error) console.error("Discover fetch failed:", error.message);
        setStudents(data || []);
        setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [profile.id]);

  const filters = ["All", "Same School", "Shares an interest"];
  const visible = students.filter((s) => {
    if (filter === "Same School") return s.school === profile.school;
    if (filter === "Shares an interest") return (s.interests || []).some((i) => profile.interests.includes(i));
    return true;
  });

  return (
    <div>
      <SectionHeader eyebrow="Find your people" title="Discover students" />
      <div className="flex gap-2 mb-6 flex-wrap">
        {filters.map((f) => (
          <FilterPill key={f} active={filter === f} onClick={() => setFilter(f)}>{f}</FilterPill>
        ))}
      </div>
      {loading && <p style={{ color: T.muted }} className="text-sm">Loading students...</p>}
      {!loading && visible.length === 0 && (
        <p style={{ color: T.muted }} className="text-sm">No one's shown up here yet — invite more testers, or check back soon.</p>
      )}
      <div className="grid sm:grid-cols-2 gap-4">
        {visible.map((s) => (
          <div key={s.id} style={{ background: T.surface, border: `1px solid ${T.border}` }} className="rounded-lg p-5 hover:border-[#FF9F45] transition-colors">
            <div className="flex items-start justify-between mb-3">
              <div className="flex gap-3 items-center">
                <Avatar initials={initialsOf(s.name)} color={colorFor(s.id)} image={s.avatar_url} />
                <div>
                  <div style={{ ...display, color: T.text }} className="font-semibold">{s.name}</div>
                  <div style={{ color: T.muted }} className="text-xs flex items-center gap-1"><MapPin size={11} /> {s.school}</div>
                </div>
              </div>
              <span style={{ ...mono, color: T.muted }} className="text-[11px]">{codeFor(s.major, s.year)}</span>
            </div>
            <p style={{ color: "#C6C9D4" }} className="text-sm mb-3 leading-relaxed">{s.bio}</p>
            <div className="flex gap-1.5 flex-wrap mb-4">
              {(s.interests || []).map((i) => <Tag key={i}>{i}</Tag>)}
            </div>
            <PrimaryButton onClick={() => onConnect(s)} className="w-full py-2">Connect</PrimaryButton>
          </div>
        ))}
      </div>
    </div>
  );
}
