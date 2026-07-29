import { useEffect, useState } from "react";
import { Briefcase, BookOpen, Users } from "lucide-react";
import { supabase } from "../supabaseClient";
import { T, display, mono } from "../theme";
import { Avatar, PrimaryButton, Tag } from "../components/ui";
import { codeFor, colorFor, initialsOf } from "../lib/profile";

// PostgREST's .or() filter string treats "," and "()" as syntax, so strip them
// out of free-typed search input rather than letting them reshape the query.
function sanitize(query) {
  return query.replace(/[,()]/g, " ").trim();
}

export function SearchResults({ query, profile, onConnect, onOpenGroup }) {
  const [results, setResults] = useState({ students: [], groups: [], internships: [], studyRequests: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    const safe = sanitize(query);
    const like = `%${safe}%`;

    (async () => {
      const [studentsRes, groupsRes, internshipsRes, studyRes] = await Promise.all([
        supabase.from("profiles").select("*").neq("id", profile.id)
          .or(`name.ilike.${like},major.ilike.${like},school.ilike.${like}`).limit(6),
        supabase.from("groups").select("*")
          .or(`name.ilike.${like},tag.ilike.${like},description.ilike.${like}`).limit(6),
        supabase.from("internships").select("*")
          .or(`role.ilike.${like},org.ilike.${like},tag.ilike.${like}`).limit(6),
        supabase.from("study_requests").select("*")
          .or(`course.ilike.${like},school.ilike.${like}`).limit(6),
      ]);
      if (!active) return;
      if (studentsRes.error) console.error("Search (students) failed:", studentsRes.error.message);
      if (groupsRes.error) console.error("Search (groups) failed:", groupsRes.error.message);
      if (internshipsRes.error) console.error("Search (internships) failed:", internshipsRes.error.message);
      if (studyRes.error) console.error("Search (study requests) failed:", studyRes.error.message);
      setResults({
        students: studentsRes.data || [],
        groups: groupsRes.data || [],
        internships: internshipsRes.data || [],
        studyRequests: studyRes.data || [],
      });
      setLoading(false);
    })();

    return () => { active = false; };
  }, [query, profile.id]);

  const empty = !loading && Object.values(results).every((list) => list.length === 0);

  return (
    <div>
      <div style={{ ...mono, color: T.muted }} className="text-[11px] tracking-widest uppercase mb-1">Search results</div>
      <h1 style={{ ...display, color: T.text }} className="text-2xl md:text-3xl font-semibold mb-6 truncate">"{query}"</h1>

      {loading && <p style={{ color: T.muted }} className="text-sm">Searching...</p>}
      {empty && <p style={{ color: T.muted }} className="text-sm">No matches — try a different name, major, school, or course.</p>}

      {results.students.length > 0 && (
        <Section icon={Users} title="Students">
          <div className="grid sm:grid-cols-2 gap-3">
            {results.students.map((s) => (
              <div key={s.id} style={{ background: T.surface, border: `1px solid ${T.border}` }} className="rounded-lg p-4 flex items-center gap-3">
                <Avatar initials={initialsOf(s.name)} color={colorFor(s.id)} image={s.avatar_url} size={36} />
                <div className="min-w-0 flex-1">
                  <div style={{ ...display, color: T.text }} className="text-sm font-semibold truncate">{s.name}</div>
                  <div style={{ color: T.muted }} className="text-xs truncate">{s.major} · {s.school} · {codeFor(s.major, s.year)}</div>
                </div>
                <PrimaryButton onClick={() => onConnect(s)} className="py-1.5 px-3 shrink-0">Connect</PrimaryButton>
              </div>
            ))}
          </div>
        </Section>
      )}

      {results.groups.length > 0 && (
        <Section icon={Users} title="Groups">
          <div className="space-y-2">
            {results.groups.map((g) => (
              <button
                key={g.id} onClick={() => onOpenGroup(g.id)}
                style={{ background: T.surface, border: `1px solid ${T.border}` }}
                className="w-full text-left rounded-lg p-4 flex items-center justify-between gap-3 hover:border-[#FF9F45] transition-colors"
              >
                <div className="min-w-0">
                  <div style={{ ...display, color: T.text }} className="text-sm font-semibold truncate">{g.name}</div>
                  <div style={{ color: T.muted }} className="text-xs truncate">{g.description}</div>
                </div>
                <Tag tone="cool">{g.tag}</Tag>
              </button>
            ))}
          </div>
        </Section>
      )}

      {results.internships.length > 0 && (
        <Section icon={Briefcase} title="Internships">
          <div className="space-y-2">
            {results.internships.map((job) => (
              <div key={job.id} style={{ background: T.surface, border: `1px solid ${T.border}` }} className="rounded-lg p-4">
                <div style={{ ...display, color: T.text }} className="text-sm font-semibold">{job.role}</div>
                <div style={{ color: T.muted }} className="text-xs">{job.org} · {job.location} · {job.term}</div>
              </div>
            ))}
          </div>
        </Section>
      )}

      {results.studyRequests.length > 0 && (
        <Section icon={BookOpen} title="Study requests">
          <div className="space-y-2">
            {results.studyRequests.map((r) => (
              <div key={r.id} style={{ background: T.surface, border: `1px solid ${T.border}` }} className="rounded-lg p-4">
                <div style={{ ...display, color: T.text }} className="text-sm font-semibold">{r.course}</div>
                <div style={{ color: T.muted }} className="text-xs">{r.school} · {r.when_text}</div>
              </div>
            ))}
          </div>
        </Section>
      )}
    </div>
  );
}

function Section({ icon: Icon, title, children }) {
  return (
    <div className="mb-8">
      <div style={{ color: T.muted }} className="flex items-center gap-2 text-xs uppercase tracking-wide mb-3">
        <Icon size={13} /> {title}
      </div>
      {children}
    </div>
  );
}
