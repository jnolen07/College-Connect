import { useRef, useState } from "react";
import { ArrowRight, Camera, Check, ChevronRight, X } from "lucide-react";
import { supabase } from "../supabaseClient";
import { T, display, mono } from "../theme";
import { Avatar, PrimaryButton, Tag } from "../components/ui";
import { INTEREST_CATEGORIES, YEARS } from "../data/constants";

export function ProfileSetup({ school, userId, onComplete }) {
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [year, setYear] = useState(YEARS[0]);
  const [major, setMajor] = useState("");
  const [interests, setInterests] = useState([]);
  const [openCat, setOpenCat] = useState(INTEREST_CATEGORIES[0].name);
  const [image, setImage] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const fileRef = useRef(null);

  const toggleInterest = (i) => {
    setInterests((prev) => {
      if (prev.includes(i)) return prev.filter((x) => x !== i);
      if (prev.length >= 3) return prev;
      return [...prev, i];
    });
  };

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = () => setImage(reader.result);
    reader.readAsDataURL(file);
  };

  const [attempted, setAttempted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const missing = [];
  if (!name.trim()) missing.push("your name");
  if (!age) missing.push("your age");
  if (!major.trim()) missing.push("your major");
  if (interests.length !== 3) missing.push(`${3 - interests.length} more interest${3 - interests.length === 1 ? "" : "s"}`);

  const handleSubmit = async () => {
    if (missing.length > 0) { setAttempted(true); return; }
    setSaving(true);
    setSaveError(null);

    // Photos go to Supabase Storage (scoped to this user's own folder by RLS),
    // not into the database as base64 text.
    let avatarUrl = null;
    if (imageFile) {
      const ext = imageFile.name.split(".").pop() || "jpg";
      const path = `${userId}/avatar-${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage.from("avatars").upload(path, imageFile, { upsert: true });
      if (uploadError) {
        setSaving(false);
        setSaveError("Couldn't upload your photo — check your connection and try again.");
        console.error(uploadError);
        return;
      }
      avatarUrl = supabase.storage.from("avatars").getPublicUrl(path).data.publicUrl;
    }

    const newProfile = { id: userId, name, age: Number(age), year, major, interests, bio: null, school, avatar_url: avatarUrl };
    const { error } = await supabase.from("profiles").insert(newProfile);
    setSaving(false);
    if (error) { setSaveError("Couldn't save your profile — check your connection and try again."); console.error(error); return; }
    onComplete(newProfile);
  };

  return (
    <div className="fixed inset-0 overflow-y-auto" style={{ background: T.bg }}>
      <div className="max-w-md mx-auto px-6 py-12">
        <div style={{ ...mono, color: T.muted }} className="text-[11px] tracking-widest uppercase mb-1">Step 2 of 2</div>
        <h1 style={{ ...display, color: T.text }} className="text-2xl font-semibold mb-1">Set up your profile</h1>
        <p style={{ color: T.muted }} className="text-sm mb-8">This is how other students at {school} will see you.</p>

        <div className="flex justify-center mb-8">
          <button onClick={() => fileRef.current?.click()} className="relative group">
            <Avatar initials={name ? name.slice(0, 2).toUpperCase() : "?"} color={T.surface2} size={84} image={image} />
            <div style={{ background: T.warm }} className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center shadow-[0_0_0_3px_#0A0C11]">
              <Camera size={13} color="#0A0C11" />
            </div>
            <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
          </button>
        </div>

        <div className="space-y-5">
          <div>
            <label style={{ ...mono, color: T.muted }} className="text-[11px] uppercase tracking-wide block mb-1.5">Name</label>
            <input
              value={name} onChange={(e) => setName(e.target.value)} placeholder="Your full name"
              style={{ background: T.surface, border: `1px solid ${T.border}`, color: T.text }}
              className="w-full text-sm px-3 py-2.5 rounded-md outline-none focus:border-[#FF9F45] placeholder:text-[#5B5F6E]"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label style={{ ...mono, color: T.muted }} className="text-[11px] uppercase tracking-wide block mb-1.5">Age</label>
              <input
                type="number" value={age} onChange={(e) => setAge(e.target.value)} placeholder="19"
                style={{ background: T.surface, border: `1px solid ${T.border}`, color: T.text }}
                className="w-full text-sm px-3 py-2.5 rounded-md outline-none focus:border-[#FF9F45] placeholder:text-[#5B5F6E]"
              />
            </div>
            <div>
              <label style={{ ...mono, color: T.muted }} className="text-[11px] uppercase tracking-wide block mb-1.5">Year</label>
              <select
                value={year} onChange={(e) => setYear(e.target.value)}
                style={{ background: T.surface, border: `1px solid ${T.border}`, color: T.text }}
                className="w-full text-sm px-3 py-2.5 rounded-md outline-none focus:border-[#FF9F45]"
              >
                {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label style={{ ...mono, color: T.muted }} className="text-[11px] uppercase tracking-wide block mb-1.5">Major</label>
            <input
              value={major} onChange={(e) => setMajor(e.target.value)} placeholder="e.g. Computer Science"
              style={{ background: T.surface, border: `1px solid ${T.border}`, color: T.text }}
              className="w-full text-sm px-3 py-2.5 rounded-md outline-none focus:border-[#FF9F45] placeholder:text-[#5B5F6E]"
            />
          </div>
          <div>
            <div className="flex items-baseline justify-between mb-1.5">
              <label style={{ ...mono, color: T.muted }} className="text-[11px] uppercase tracking-wide">Pick 3 interests</label>
              <span style={{ ...mono, color: interests.length === 3 ? T.cool : T.muted }} className="text-[11px]">{interests.length}/3</span>
            </div>

            {interests.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-3">
                {interests.map((i) => (
                  <button
                    key={i} onClick={() => toggleInterest(i)}
                    style={{ background: T.warmDim, color: T.warm, border: `1px solid ${T.warm}` }}
                    className="text-xs pl-3 pr-2 py-1.5 rounded-full flex items-center gap-1"
                  >
                    {i} <X size={11} />
                  </button>
                ))}
              </div>
            )}

            <div className="space-y-2">
              {INTEREST_CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                const isOpen = openCat === cat.name;
                const countInCat = cat.options.filter((o) => interests.includes(o)).length;
                return (
                  <div key={cat.name} style={{ background: T.surface, border: `1px solid ${T.border}` }} className="rounded-md overflow-hidden">
                    <button
                      onClick={() => setOpenCat(isOpen ? null : cat.name)}
                      className="w-full flex items-center justify-between px-3 py-2.5"
                    >
                      <span style={{ color: T.text }} className="text-sm font-medium flex items-center gap-2">
                        <Icon size={15} color={T.muted} /> {cat.name}
                      </span>
                      <span className="flex items-center gap-2">
                        {countInCat > 0 && <Tag tone="warm">{countInCat}</Tag>}
                        <ChevronRight
                          size={15} color={T.muted}
                          style={{ transform: isOpen ? "rotate(90deg)" : "none", transition: "transform 200ms" }}
                        />
                      </span>
                    </button>
                    {isOpen && (
                      <div style={{ borderColor: T.border }} className="flex flex-wrap gap-2 px-3 pb-3 pt-1 border-t">
                        {cat.options.map((i) => {
                          const selected = interests.includes(i);
                          const disabled = !selected && interests.length >= 3;
                          return (
                            <button
                              key={i}
                              onClick={() => toggleInterest(i)}
                              disabled={disabled}
                              style={{
                                background: selected ? T.warmDim : T.bg,
                                color: selected ? T.warm : disabled ? "#4A4E5C" : T.muted,
                                border: `1px solid ${selected ? T.warm : T.border}`,
                              }}
                              className="text-xs px-3 py-1.5 rounded-full transition-colors flex items-center gap-1 disabled:cursor-not-allowed mt-2"
                            >
                              {selected && <Check size={11} />}
                              {i}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <PrimaryButton onClick={handleSubmit} disabled={saving} className="w-full mt-9 py-3 flex items-center justify-center gap-2">
          {saving ? "Saving..." : <>Enter College Connect <ArrowRight size={15} /></>}
        </PrimaryButton>
        {attempted && missing.length > 0 && (
          <p style={{ color: "#F45B69" }} className="text-xs text-center mt-3">
            Just need: {missing.join(", ")}
          </p>
        )}
        {saveError && (
          <p style={{ color: "#F45B69" }} className="text-xs text-center mt-3">{saveError}</p>
        )}
      </div>
    </div>
  );
}
