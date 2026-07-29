import { useEffect, useState } from "react";
import { Search, Sparkles } from "lucide-react";
import { supabase } from "./supabaseClient";
import { T, display, mono } from "./theme";
import { Avatar } from "./components/ui";
import { NAV } from "./data/constants";
import { AuthScreen } from "./onboarding/AuthScreen";
import { MapIntro } from "./onboarding/MapIntro";
import { Welcome } from "./onboarding/Welcome";
import { ProfileSetup } from "./onboarding/ProfileSetup";
import { Discover } from "./panels/Discover";
import { Groups } from "./panels/Groups";
import { Messages } from "./panels/Messages";
import { Profile } from "./panels/Profile";
import { SearchResults } from "./panels/SearchResults";

export default function CollegeConnect() {
  const [stage, setStage] = useState("restoring"); // restoring -> auth -> map -> welcome -> setup -> app
  const [school, setSchool] = useState("");
  const [userId, setUserId] = useState(null);
  const [profile, setProfile] = useState(null);
  const [tab, setTab] = useState("discover");
  const [pendingChatWith, setPendingChatWith] = useState(null);
  const [pendingOpenGroupId, setPendingOpenGroupId] = useState(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    let active = true;

    const resolveSession = async (session) => {
      if (!session) {
        if (active) { setProfile(null); setUserId(null); setStage("auth"); }
        return;
      }
      const { data, error } = await supabase.from("profiles").select("*").eq("id", session.user.id).single();
      if (!active) return;
      if (data && !error) {
        setProfile(data);
        setStage("app");
      } else {
        setUserId(session.user.id);
        setStage((s) => (s === "app" || s === "restoring" ? "map" : s));
      }
    };

    supabase.auth.getSession().then(({ data }) => resolveSession(data.session));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => resolveSession(session));

    return () => { active = false; listener.subscription.unsubscribe(); };
  }, []);

  const connectWith = (person) => { setPendingChatWith(person); setQuery(""); setTab("messages"); };
  const openGroup = (groupId) => { setPendingOpenGroupId(groupId); setQuery(""); setTab("groups"); };
  const goToTab = (id) => { setTab(id); setQuery(""); };

  if (stage === "restoring") {
    return (
      <div className="fixed inset-0 flex items-center justify-center" style={{ background: T.bg }}>
        <span style={{ ...mono, color: T.muted }} className="text-xs uppercase tracking-widest">Loading...</span>
      </div>
    );
  }
  if (stage === "auth") return <AuthScreen />;
  if (stage === "map") return <MapIntro onDone={(s) => { setSchool(s); setStage("welcome"); }} />;
  if (stage === "welcome") return <Welcome school={school} onNext={() => setStage("setup")} />;
  if (stage === "setup") return <ProfileSetup school={school} userId={userId} onComplete={(p) => { setProfile(p); setStage("app"); }} />;

  const showSearch = query.trim().length > 0;
  const panel = showSearch
    ? <SearchResults query={query} profile={profile} onConnect={connectWith} onOpenGroup={openGroup} />
    : {
        discover: <Discover profile={profile} onConnect={connectWith} />,
        groups: <Groups profile={profile} pendingOpenGroupId={pendingOpenGroupId} onConsumePendingOpen={() => setPendingOpenGroupId(null)} />,
        messages: <Messages profile={profile} pendingChatWith={pendingChatWith} onConsumePending={() => setPendingChatWith(null)} />,
        profile: <Profile profile={profile} onUpdate={setProfile} />,
      }[tab];

  return (
    <div style={{ background: T.bg, color: T.text, fontFamily: "'Inter', sans-serif" }} className="min-h-screen flex">
      <aside style={{ borderColor: T.border }} className="hidden md:flex md:w-60 shrink-0 border-r flex-col py-6 px-4">
        <div className="flex items-center gap-2 px-2 mb-8">
          <div style={{ background: T.warm }} className="w-8 h-8 rounded-md flex items-center justify-center">
            <Sparkles size={16} color="#0A0C11" />
          </div>
          <span style={{ ...display }} className="font-semibold text-lg">College Connect</span>
        </div>
        <nav className="flex flex-col gap-1">
          {NAV.map((n) => {
            const Icon = n.icon;
            const isActive = !showSearch && tab === n.id;
            return (
              <button
                key={n.id} onClick={() => goToTab(n.id)}
                style={{ background: isActive ? T.surface2 : "transparent", color: isActive ? T.warm : T.muted }}
                className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors hover:brightness-125"
              >
                <Icon size={16} /> {n.label}
              </button>
            );
          })}
        </nav>
        <div className="mt-auto px-3">
          <div style={{ ...mono, color: T.muted }} className="text-[10px] uppercase tracking-wide flex items-center gap-2 mb-2">
            <Avatar initials={profile.name.slice(0, 2).toUpperCase()} color={T.surface2} size={22} image={profile.avatar_url} />
            {profile.name.split(" ")[0]} · {profile.school}
          </div>
          <button
            onClick={() => supabase.auth.signOut()}
            style={{ ...mono, color: T.muted }}
            className="text-[10px] uppercase tracking-wide hover:text-[#F2F1EC] transition-colors"
          >
            Sign out
          </button>
        </div>
      </aside>

      <div style={{ background: T.surface, borderColor: T.border }} className="md:hidden fixed bottom-0 left-0 right-0 border-t flex justify-around py-2 z-10">
        {NAV.map((n) => {
          const Icon = n.icon;
          const isActive = !showSearch && tab === n.id;
          return (
            <button key={n.id} onClick={() => goToTab(n.id)} style={{ color: isActive ? T.warm : T.muted }} className="p-2 rounded-md">
              <Icon size={20} />
            </button>
          );
        })}
      </div>

      <main className="flex-1 min-w-0">
        <header style={{ borderColor: T.border }} className="md:hidden flex items-center gap-2 px-5 py-4 border-b">
          <div style={{ background: T.warm }} className="w-7 h-7 rounded-md flex items-center justify-center">
            <Sparkles size={14} color="#0A0C11" />
          </div>
          <span style={display} className="font-semibold">College Connect</span>
        </header>
        <div className="max-w-4xl mx-auto px-5 md:px-10 py-8 pb-24 md:pb-8">
          <div style={{ background: T.surface, border: `1px solid ${T.border}` }} className="hidden md:flex items-center gap-2 mb-8 rounded-md px-3 py-2 max-w-md">
            <Search size={15} color={T.muted} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search students, groups, courses..."
              style={{ color: T.text }}
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-[#5B5F6E]"
            />
          </div>
          {panel}
        </div>
      </main>
    </div>
  );
}
