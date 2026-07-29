import React, { useState, useRef, useEffect } from "react";
import {
  Search, Users, MessageCircle, Briefcase, BookOpen, User, Compass,
  MapPin, GraduationCap, Send, Plus, Sparkles, Clock, ArrowRight, Camera, Check,
  ChevronRight, ChevronLeft, Lock, Dumbbell, Music, Palette, Gamepad2, Brain, Coffee, X
} from "lucide-react";
import { supabase } from "./supabaseClient";

// ---------- Theme tokens ----------
const T = {
  bg: "#0A0C11",
  surface: "#12151D",
  surface2: "#1B1F2A",
  border: "#262B38",
  text: "#F2F1EC",
  muted: "#8E93A6",
  warm: "#FF9F45",
  warmDim: "rgba(255,159,69,0.14)",
  cool: "#4FD1C5",
  coolDim: "rgba(79,209,197,0.14)",
};

const display = { fontFamily: "'Space Grotesk', sans-serif" };
const mono = { fontFamily: "'IBM Plex Mono', monospace" };

// ---------- Mock data ----------
const STUDENTS = [
  { id: 1, name: "Maya Okafor", school: "UC Berkeley", major: "Computer Science", year: "Junior", code: "CS·27",
    interests: ["Basketball", "Hackathons", "Jazz"], bio: "Building a campus ride-share app. Always down for pickup ball at RSF.", avatar: "MO", color: "#FF9F45" },
  { id: 2, name: "Diego Fernandez", school: "UC Berkeley", major: "Mechanical Engineering", year: "Sophomore", code: "ME·28",
    interests: ["Rock Climbing", "Robotics", "Coffee"], bio: "On the robotics team, competing at Regionals this spring.", avatar: "DF", color: "#4FD1C5" },
  { id: 3, name: "Priya Nair", school: "NYU", major: "Economics", year: "Senior", code: "EC·25",
    interests: ["Debate", "Running", "Podcasts"], bio: "Applying to consulting internships this fall — happy to swap notes.", avatar: "PN", color: "#8B7CF6" },
  { id: 4, name: "Sam Whitfield", school: "NYU", major: "Film Studies", year: "Junior", code: "FS·27",
    interests: ["Photography", "Soccer", "Vinyl"], bio: "Shooting a short film this semester, looking for a boom operator.", avatar: "SW", color: "#F45B69" },
  { id: 5, name: "Aisha Bello", school: "University of Michigan", major: "Biology", year: "Freshman", code: "BI·29",
    interests: ["Swimming", "Volunteering", "Chess"], bio: "Pre-med, swim team, still figuring out my study rhythm.", avatar: "AB", color: "#FF9F45" },
  { id: 6, name: "Noah Kim", school: "University of Michigan", major: "Computer Science", year: "Senior", code: "CS·25",
    interests: ["Basketball", "Esports", "Startups"], bio: "TA for Data Structures. Building a startup on the side.", avatar: "NK", color: "#4FD1C5" },
];

const GROUPS = [
  { id: 1, name: "CS Majors — Berkeley", members: 842, tag: "Academic", desc: "Problem sets, project teams, and internship threads for CS students.", type: "discussion", relatedInterests: ["Hackathons", "Startups", "Gaming"] },
  { id: 2, name: "Intramural Soccer", members: 213, tag: "Sports", desc: "Pickup games every Tuesday and Thursday, all skill levels.", type: "discussion", relatedInterests: ["Soccer", "Running"] },
  { id: 3, name: "Pre-Med Study Hall", members: 501, tag: "Academic", desc: "MCAT prep, lab partners, and organic chem survival tips.", type: "discussion", relatedInterests: ["Volunteering", "Chess"] },
  { id: 4, name: "Film & Photography Club", members: 156, tag: "Creative", desc: "Crew calls, gear swaps, and screening nights.", type: "discussion", relatedInterests: ["Photography", "Film"] },
  { id: 5, name: "First-Gen Students Network", members: 389, tag: "Community", desc: "Peer mentorship and resources for first-generation college students.", type: "discussion", relatedInterests: ["Volunteering"] },
  { id: 6, name: "Internship & Career Board", members: 674, tag: "Career", desc: "Post and browse internship leads shared by fellow students.", type: "board-internships", relatedInterests: ["Startups"] },
  { id: 7, name: "Study Buddy Board", members: 428, tag: "Study", desc: "Find classmates to study with, by course and time.", type: "board-study", relatedInterests: ["Chess"] },
];

const GROUP_POSTS = {
  1: [
    { id: 1, author: "Maya Okafor", initials: "MO", color: "#FF9F45", time: "1h", text: "Anyone want to pair up for the HW6 project? Looking for a partner who's solid on graphs." },
    { id: 2, author: "Noah Kim", initials: "NK", color: "#4FD1C5", time: "3h", text: "Posted my notes from today's lecture on hash maps in the shared drive." },
  ],
  2: [
    { id: 1, author: "Diego Fernandez", initials: "DF", color: "#4FD1C5", time: "45m", text: "We're short a goalie for Thursday's game, anyone free?" },
  ],
  3: [
    { id: 1, author: "Aisha Bello", initials: "AB", color: "#FF9F45", time: "2h", text: "Organic chem practice set from last year — dropping it here for anyone who wants extra reps." },
  ],
  4: [
    { id: 1, author: "Sam Whitfield", initials: "SW", color: "#F45B69", time: "5h", text: "Still need a boom operator for Saturday's shoot, 2-hour call time." },
  ],
  5: [
    { id: 1, author: "Priya Nair", initials: "PN", color: "#8B7CF6", time: "1d", text: "Reminder: mentorship sign-ups close Friday, link's in the group notes." },
  ],
};

const INTERNSHIPS = [
  { id: 1, role: "Software Engineering Intern", org: "Fieldstone Analytics", location: "Remote", term: "Summer '27", postedBy: "Maya Okafor", tag: "Tech" },
  { id: 2, role: "Marketing Intern", org: "Harbor & Co.", location: "New York, NY", term: "Fall '26", postedBy: "Priya Nair", tag: "Business" },
  { id: 3, role: "Research Assistant", org: "Michigan Neuroscience Lab", location: "Ann Arbor, MI", term: "Spring '27", postedBy: "Aisha Bello", tag: "Research" },
  { id: 4, role: "Robotics Intern", org: "Vantage Motion", location: "Berkeley, CA", term: "Summer '27", postedBy: "Diego Fernandez", tag: "Engineering" },
];

const STUDY_REQUESTS = [
  { id: 1, course: "CS 61B — Data Structures", school: "UC Berkeley", postedBy: "Noah Kim", when: "Tues/Thurs evenings", note: "Prepping for the final, want to trade practice problems." },
  { id: 2, course: "ORGO 2", school: "University of Michigan", postedBy: "Aisha Bello", when: "Weekends", note: "Lab practical is kicking my butt, looking for a study pod." },
  { id: 3, course: "ECON 101", school: "NYU", postedBy: "Priya Nair", when: "Weekday mornings", note: "Reviewing for midterm, coffee shop sessions preferred." },
];

const CONVERSATIONS = [
  { id: 1, name: "Diego Fernandez", avatar: "DF", color: "#4FD1C5", last: "Yeah the climbing gym on Tuesday works for me", time: "2m",
    thread: [
      { from: "them", text: "Hey! Saw you're also in ME 106, want to compare notes?" },
      { from: "me", text: "For sure — I'm free after 4 most days" },
      { from: "them", text: "Yeah the climbing gym on Tuesday works for me" },
    ] },
  { id: 2, name: "Priya Nair", avatar: "PN", color: "#8B7CF6", last: "Sending over my resume draft now", time: "1h",
    thread: [
      { from: "them", text: "Can you take a look at my resume before I apply?" },
      { from: "me", text: "Of course, send it over" },
      { from: "them", text: "Sending over my resume draft now" },
    ] },
  { id: 3, name: "CS Majors — Berkeley", avatar: "CS", color: "#FF9F45", last: "Anyone free to pair on the HW6 project?", time: "3h",
    thread: [
      { from: "them", text: "Anyone free to pair on the HW6 project?" },
    ] },
];

// A broad cross-section of US colleges & universities — all 50 states + DC,
// spanning large public flagships, private universities, HBCUs, tribal colleges,
// and community/junior colleges. Not an exhaustive federal registry (~6,000+ exist),
// but built for broad, realistic autocomplete coverage.
const SCHOOLS = [
  "University of Alabama","Auburn University","University of Alabama at Birmingham","Alabama State University","Alabama A&M University","Tuskegee University","Troy University","Jacksonville State University","University of South Alabama","Samford University","Lawson State Community College","Shelton State Community College",
  "University of Alaska Fairbanks","University of Alaska Anchorage","University of Alaska Southeast","Alaska Pacific University",
  "Arizona State University","University of Arizona","Northern Arizona University","Grand Canyon University","Pima Community College","Mesa Community College","Maricopa Community College",
  "University of Arkansas","Arkansas State University","University of Central Arkansas","Hendrix College","Arkansas Tech University","Philander Smith College",
  "UC Berkeley","UCLA","UC San Diego","UC Davis","UC Irvine","UC Santa Barbara","UC Santa Cruz","UC Riverside","UC Merced","Stanford University","University of Southern California","Cal Poly San Luis Obispo","San Diego State University","San Jose State University","San Francisco State University","Sacramento State","Santa Monica College","De Anza College","Pasadena City College","Los Angeles City College","Cal State Long Beach","Cal State Fullerton","Chapman University","Pepperdine University","Occidental College","Pomona College","Claremont McKenna College","Harvey Mudd College","Scripps College","Pitzer College","City College of San Francisco","Foothill College","Diablo Valley College","Orange Coast College","Mt. San Antonio College","Monterey Peninsula College","Hartnell College","Gavilan College","Cabrillo College",
  "University of Colorado Boulder","Colorado State University","Colorado School of Mines","University of Denver","Colorado College","Metropolitan State University of Denver","Community College of Denver","Front Range Community College","Pikes Peak Community College",
  "Yale University","University of Connecticut","Wesleyan University","Trinity College","Fairfield University","Quinnipiac University","Central Connecticut State University",
  "University of Delaware","Delaware State University","Wilmington University",
  "University of Florida","Florida State University","University of Miami","University of Central Florida","Florida International University","University of South Florida","Florida A&M University","Miami Dade College","Valencia College","Rollins College","Full Sail University","Nova Southeastern University","Broward College","Palm Beach State College","St. Petersburg College","Florida Memorial University","Bethune-Cookman University",
  "University of Georgia","Georgia Institute of Technology","Georgia State University","Emory University","Spelman College","Morehouse College","Clark Atlanta University","Georgia Southern University","Kennesaw State University","Agnes Scott College",
  "University of Hawaii at Manoa","University of Hawaii at Hilo","Hawaii Pacific University","Chaminade University of Honolulu",
  "University of Idaho","Boise State University","Idaho State University","Northwest Nazarene University",
  "University of Illinois Urbana-Champaign","University of Chicago","Northwestern University","DePaul University","Loyola University Chicago","Illinois State University","Southern Illinois University","University of Illinois Chicago","Northern Illinois University","Wheaton College","Bradley University","Harper College","College of DuPage","Oakton Community College",
  "Indiana University Bloomington","Purdue University","University of Notre Dame","Ball State University","Butler University","Indiana State University","DePauw University","Ivy Tech Community College",
  "University of Iowa","Iowa State University","Drake University","Grinnell College","University of Northern Iowa",
  "University of Kansas","Kansas State University","Wichita State University","Emporia State University","Johnson County Community College",
  "University of Kentucky","University of Louisville","Western Kentucky University","Eastern Kentucky University","Murray State University","Berea College",
  "Louisiana State University","Tulane University","University of New Orleans","Xavier University of Louisiana","Southern University","Loyola University New Orleans","Grambling State University",
  "University of Maine","Bowdoin College","Colby College","Bates College","University of Southern Maine",
  "University of Maryland College Park","Johns Hopkins University","Towson University","Morgan State University","Loyola University Maryland","University of Maryland Baltimore County","Montgomery College","Prince George's Community College","Anne Arundel Community College",
  "Harvard University","Massachusetts Institute of Technology","Boston University","Boston College","Tufts University","UMass Amherst","Northeastern University","Williams College","Amherst College","Smith College","Wellesley College","Mount Holyoke College","Berklee College of Music","Bunker Hill Community College","Northern Essex Community College",
  "University of Michigan","Michigan State University","Wayne State University","Western Michigan University","Central Michigan University","Grand Valley State University","Kalamazoo College",
  "University of Minnesota Twin Cities","Carleton College","Macalester College","St. Olaf College","Minnesota State University Mankato","University of St. Thomas",
  "University of Mississippi","Mississippi State University","Jackson State University","Alcorn State University","University of Southern Mississippi","Mississippi Valley State University",
  "University of Missouri","Washington University in St. Louis","Saint Louis University","Missouri State University","Truman State University",
  "University of Montana","Montana State University",
  "University of Nebraska-Lincoln","Creighton University","University of Nebraska Omaha",
  "University of Nevada Las Vegas","University of Nevada Reno",
  "Dartmouth College","University of New Hampshire","Southern New Hampshire University",
  "Princeton University","Rutgers University","Rowan University","Seton Hall University","Montclair State University","Stevens Institute of Technology","The College of New Jersey",
  "University of New Mexico","New Mexico State University","New Mexico Institute of Mining and Technology",
  "Columbia University","Cornell University","New York University","Syracuse University","University of Rochester","Fordham University","Barnard College","CUNY Hunter College","CUNY Baruch College","Binghamton University","Stony Brook University","University at Buffalo","Rensselaer Polytechnic Institute","Colgate University","Vassar College","Sarah Lawrence College","Ithaca College","Pratt Institute","The New School","Nassau Community College","Suffolk County Community College","Westchester Community College",
  "UNC Chapel Hill","Duke University","North Carolina State University","Wake Forest University","Davidson College","Elon University","UNC Charlotte","North Carolina A&T State University","North Carolina Central University","Fayetteville State University","Winston-Salem State University","Wake Technical Community College","Central Piedmont Community College",
  "University of North Dakota","North Dakota State University","Turtle Mountain Community College",
  "Ohio State University","Case Western Reserve University","University of Cincinnati","Miami University","Kent State University","Ohio University","Oberlin College","Denison University","Xavier University","Cuyahoga Community College","Columbus State Community College","Sinclair Community College",
  "University of Oklahoma","Oklahoma State University","University of Tulsa","Tulsa Community College",
  "University of Oregon","Oregon State University","Portland State University","Reed College","Lewis & Clark College","Portland Community College",
  "University of Pennsylvania","Penn State University","Carnegie Mellon University","University of Pittsburgh","Temple University","Drexel University","Swarthmore College","Bryn Mawr College","Haverford College","Villanova University","Lehigh University","Bucknell University",
  "Brown University","University of Rhode Island","Providence College","Rhode Island School of Design",
  "University of South Carolina","Clemson University","College of Charleston","Furman University",
  "University of South Dakota","South Dakota State University","Sitting Bull College",
  "University of Tennessee","Vanderbilt University","Belmont University","Rhodes College","Middle Tennessee State University","Fisk University","Tennessee State University","Meharry Medical College",
  "University of Texas at Austin","Texas A&M University","Rice University","University of Houston","Southern Methodist University","Baylor University","Texas Tech University","Texas Christian University","Texas State University","Trinity University","Prairie View A&M University","Texas Southern University","Houston Community College","Austin Community College","Tarrant County College","Lone Star College","San Antonio College","Collin College","El Paso Community College",
  "University of Utah","Brigham Young University","Utah State University","Weber State University","Salt Lake Community College",
  "University of Vermont","Middlebury College","Champlain College",
  "University of Virginia","Virginia Tech","William & Mary","George Mason University","Virginia Commonwealth University","James Madison University","Washington and Lee University","Hampton University","Old Dominion University","Tidewater Community College","Northern Virginia Community College",
  "University of Washington","Washington State University","Gonzaga University","Seattle University","Western Washington University","Whitman College","Clark College","Bellevue College","Spokane Community College","Green River College",
  "West Virginia University","Marshall University",
  "University of Wisconsin-Madison","Marquette University","University of Wisconsin-Milwaukee","Beloit College",
  "University of Wyoming",
  "Georgetown University","George Washington University","American University","Howard University","Catholic University of America",
  "Diné College","Salish Kootenai College","Navajo Technical University","Oglala Lakota College","Northwest Indian College",
];

function matchSchools(query, limit = 6) {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return SCHOOLS.filter((s) => s.toLowerCase().includes(q)).slice(0, limit);
}

const NAV = [
  { id: "discover", label: "Discover", icon: Compass },
  { id: "groups", label: "Groups", icon: Users },
  { id: "messages", label: "Messages", icon: MessageCircle },
  { id: "profile", label: "Profile", icon: User },
];

const INTEREST_CATEGORIES = [
  { name: "Sports & Fitness", icon: Dumbbell, options: ["Basketball", "Soccer", "Football", "Volleyball", "Tennis", "Swimming", "Running", "Rock Climbing", "Baseball", "Golf", "Hockey", "Yoga", "Cycling", "Esports"] },
  { name: "Music", icon: Music, options: ["Jazz", "Hip-Hop", "Rock", "Pop", "Classical", "EDM", "Country", "Indie", "R&B", "Vinyl Collecting"] },
  { name: "Arts & Media", icon: Palette, options: ["Photography", "Film", "Theater", "Dance", "Painting", "Writing", "Fashion"] },
  { name: "Gaming & Tech", icon: Gamepad2, options: ["Video Games", "Hackathons", "Robotics", "Startups", "Coding"] },
  { name: "Academic & Career", icon: Brain, options: ["Debate", "Research", "Volunteering", "Entrepreneurship"] },
  { name: "Lifestyle", icon: Coffee, options: ["Chess", "Cooking", "Travel", "Coffee", "Podcasts", "Reading"] },
];

const YEARS = ["Freshman", "Sophomore", "Junior", "Senior", "Grad Student"];

// ---------- Small building blocks ----------
function Tag({ children, tone = "default" }) {
  const tones = {
    default: { bg: T.surface2, fg: T.muted },
    warm: { bg: T.warmDim, fg: T.warm },
    cool: { bg: T.coolDim, fg: T.cool },
  };
  const t = tones[tone];
  return (
    <span style={{ background: t.bg, color: t.fg, ...mono }} className="text-[11px] tracking-wide px-2 py-1 rounded-sm uppercase">
      {children}
    </span>
  );
}

function Avatar({ initials, color, size = 40, image }) {
  return (
    <div
      style={{
        width: size, height: size,
        background: image ? `center/cover no-repeat url(${image})` : color,
        boxShadow: `0 0 0 1px ${T.border}`,
      }}
      className="rounded-full flex items-center justify-center text-white font-semibold shrink-0 overflow-hidden"
    >
      {!image && <span style={{ ...display, fontSize: size * 0.36 }}>{initials}</span>}
    </div>
  );
}

function SectionHeader({ eyebrow, title, action }) {
  return (
    <div className="flex items-end justify-between mb-6">
      <div>
        <div style={{ ...mono, color: T.muted }} className="text-[11px] tracking-widest uppercase mb-1">{eyebrow}</div>
        <h1 style={{ ...display, color: T.text }} className="text-2xl md:text-3xl font-semibold">{title}</h1>
      </div>
      {action}
    </div>
  );
}

function PrimaryButton({ children, onClick, className = "", disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{ background: disabled ? T.surface2 : T.warm, color: disabled ? T.muted : "#0A0C11" }}
      className={`text-sm font-semibold px-4 py-2 rounded-md transition-all hover:brightness-110 disabled:cursor-not-allowed ${className}`}
    >
      {children}
    </button>
  );
}

// ---------- Onboarding: Map ----------
const MAP_SPOTS = [
  { x: 165, y: 170 }, { x: 290, y: 165 }, { x: 470, y: 195 }, { x: 625, y: 180 },
  { x: 140, y: 360 }, { x: 605, y: 330 }, { x: 705, y: 525 }, { x: 190, y: 595 },
  { x: 355, y: 595 }, { x: 515, y: 605 }, { x: 650, y: 650 }, { x: 260, y: 690 },
];

function pickSpot(query) {
  let h = 0;
  for (let i = 0; i < query.length; i++) h = (h * 31 + query.charCodeAt(i)) % MAP_SPOTS.length;
  return MAP_SPOTS[Math.abs(h)];
}

// ---------- Sign-in ----------
// Real authentication via Supabase Auth magic links — no password to manage,
// and the resulting session (auth.uid()) is what every Row Level Security
// policy in supabase/schema.sql scopes reads and writes to.
function AuthScreen() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);

  const submit = async () => {
    if (!email.trim() || sending) return;
    setSending(true);
    setError(null);
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: window.location.origin },
    });
    setSending(false);
    if (error) { setError(error.message); return; }
    setSent(true);
  };

  if (sent) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center px-6 text-center" style={{ background: "#080A0E" }}>
        <div style={{ background: T.coolDim }} className="w-12 h-12 rounded-xl flex items-center justify-center mb-5">
          <Send size={18} color={T.cool} />
        </div>
        <h1 style={{ ...display, color: T.text }} className="text-2xl font-semibold mb-2">Check your email</h1>
        <p style={{ color: T.muted }} className="text-sm max-w-xs">
          We sent a sign-in link to <span style={{ color: T.text }}>{email}</span>. Open it on this device to continue.
        </p>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center px-6" style={{ background: "#080A0E" }}>
      <div style={{ background: T.warmDim }} className="w-12 h-12 rounded-xl flex items-center justify-center mb-5">
        <Lock size={20} color={T.warm} />
      </div>
      <h1 style={{ ...display, color: T.text }} className="text-2xl font-semibold mb-1 text-center">College Connect</h1>
      <p style={{ color: T.muted }} className="text-sm mb-8 text-center max-w-xs">
        Sign in with your email — we'll send a magic link, no password needed.
      </p>
      <div
        style={{ background: T.surface, border: `1px solid ${error ? "#F45B69" : T.border}` }}
        className="flex items-center gap-2 rounded-full px-4 py-3 w-full max-w-xs"
      >
        <input
          autoFocus
          type="email"
          value={email}
          onChange={(e) => { setEmail(e.target.value); setError(null); }}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          placeholder="you@school.edu"
          style={{ color: T.text }}
          className="flex-1 bg-transparent text-sm outline-none placeholder:text-[#5B5F6E]"
        />
      </div>
      {error && <p style={{ color: "#F45B69" }} className="text-xs mt-2 max-w-xs text-center">{error}</p>}
      <PrimaryButton onClick={submit} disabled={sending || !email.trim()} className="mt-5 px-6 py-2.5">
        {sending ? "Sending..." : "Send magic link"}
      </PrimaryButton>
    </div>
  );
}

function MapIntro({ onDone }) {
  const [query, setQuery] = useState("");
  const [phase, setPhase] = useState("idle"); // idle -> liftoff -> flying -> arriving -> flashing -> fading
  const [spot, setSpot] = useState(MAP_SPOTS[0]);
  const suggestions = phase === "idle" ? matchSchools(query) : [];

  const go = (value) => {
    const finalQuery = (value ?? query).trim();
    if (!finalQuery || phase !== "idle") return;
    setQuery(finalQuery);
    setSpot(pickSpot(finalQuery.toLowerCase()));
    setPhase("liftoff");
    setTimeout(() => setPhase("flying"), 280);
    setTimeout(() => setPhase("arriving"), 1300);
    setTimeout(() => setPhase("flashing"), 2050);
    setTimeout(() => setPhase("fading"), 2300);
    setTimeout(() => onDone(finalQuery), 2950);
  };

  const fracX = spot.x / 800;
  const fracY = spot.y / 800;
  const dx = (0.5 - fracX) * 100;
  const dy = (0.5 - fracY) * 100;
  const panned = phase !== "idle" && phase !== "liftoff";
  const arrived = phase === "arriving" || phase === "flashing" || phase === "fading";

  const scale = phase === "idle" ? 1 : phase === "liftoff" ? 0.92 : phase === "flying" ? 2.3 : 9;
  const duration = phase === "liftoff" ? 280 : phase === "flying" ? 1000 : phase === "arriving" ? 750 : 300;
  const easing = phase === "flying" ? "cubic-bezier(0.45,0,0.2,1)" : phase === "arriving" ? "cubic-bezier(0.3,0,0.15,1)" : "ease-out";

  // Flight-path overlay lives in a fixed 0-100 percent space, independent of the map's own zoom.
  const pathId = "flightpath";
  const showPath = phase === "liftoff" || phase === "flying";

  return (
    <div className="fixed inset-0 overflow-hidden" style={{ background: "#080A0E" }}>
      <div
        className="absolute inset-0 transition-transform"
        style={{
          transitionDuration: `${duration}ms`,
          transitionTimingFunction: easing,
          transform: `translate(${panned ? dx : 0}%, ${panned ? dy : 0}%) scale(${scale})`,
          transformOrigin: "50% 50%",
        }}
      >
        <MapArt pinX={spot.x} pinY={spot.y} bounce={arrived} />
      </div>

      {/* Flight path: a curved line + traveling beacon from center to destination */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none" style={{ opacity: showPath ? 1 : 0, transition: "opacity 300ms" }}>
        <path
          id={pathId}
          d={`M 50 50 Q ${(50 + dx * -1 + 50) / 2} ${(50 + dy * -1 + 50) / 2 - 12} ${50 - dx} ${50 - dy}`}
          fill="none" stroke={T.warm} strokeWidth="0.25" strokeDasharray="1.5 1.5" opacity="0.5"
        />
        {phase === "flying" && (
          <circle r="0.9" fill={T.warm}>
            <animateMotion dur="1000ms" fill="freeze" path={`M 50 50 Q ${(50 + dx * -1 + 50) / 2} ${(50 + dy * -1 + 50) / 2 - 12} ${50 - dx} ${50 - dy}`} />
          </circle>
        )}
      </svg>

      {/* Warm flash right before the cut to black */}
      <div
        className="absolute inset-0 transition-opacity pointer-events-none"
        style={{ background: T.warm, transitionDuration: "250ms", opacity: phase === "flashing" ? 0.55 : 0 }}
      />

      <div
        className="absolute inset-0 bg-black transition-opacity"
        style={{ transitionDuration: "650ms", opacity: phase === "fading" ? 1 : 0, pointerEvents: "none" }}
      />

      <div
        className="absolute inset-0 flex flex-col items-center justify-center px-6 transition-opacity"
        style={{ opacity: phase === "idle" ? 1 : 0, transitionDuration: "300ms" }}
      >
        <div style={{ background: T.warm }} className="w-12 h-12 rounded-xl flex items-center justify-center mb-5 shadow-[0_0_40px_rgba(255,159,69,0.5)]">
          <Sparkles size={22} color="#0A0C11" />
        </div>
        <h1 style={{ ...display, color: T.text }} className="text-3xl md:text-4xl font-semibold mb-2 text-center">College Connect</h1>
        <p style={{ color: T.muted }} className="text-sm mb-8 text-center">Type your school to find your campus</p>
        <div
          style={{ background: T.surface, border: `1px solid ${T.border}` }}
          className="flex items-center gap-2 rounded-full px-4 py-3 w-full max-w-sm shadow-[0_0_60px_rgba(255,159,69,0.08)]"
        >
          <MapPin size={16} color={T.warm} className="shrink-0" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && go()}
            placeholder="e.g. UC Berkeley"
            style={{ color: T.text }}
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-[#5B5F6E]"
          />
          <button
            onClick={() => go()}
            disabled={!query.trim()}
            style={{ background: query.trim() ? T.warm : T.surface2 }}
            className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors disabled:cursor-not-allowed"
          >
            <ArrowRight size={15} color={query.trim() ? "#0A0C11" : T.muted} />
          </button>
        </div>
        {suggestions.length > 0 && (
          <div
            style={{ background: T.surface, border: `1px solid ${T.border}` }}
            className="w-full max-w-sm mt-2 rounded-xl overflow-hidden"
          >
            {suggestions.map((s) => (
              <button
                key={s}
                onClick={() => go(s)}
                style={{ color: T.text, borderColor: T.border }}
                className="w-full text-left text-sm px-4 py-2.5 hover:bg-[#1B1F2A] border-b last:border-b-0 flex items-center gap-2"
              >
                <MapPin size={12} color={T.muted} className="shrink-0" />
                {s}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function MapArt({ pinX = 405, pinY = 440, bounce = false }) {
  // Decorative abstract campus map — grid of blocks, paths, and a glowing pin.
  return (
    <svg viewBox="0 0 800 800" className="w-full h-full" preserveAspectRatio="xMidYMid slice">
      <rect width="800" height="800" fill="#0D1017" />
      <g stroke="#1C2130" strokeWidth="1.5">
        {Array.from({ length: 17 }).map((_, i) => (
          <line key={"v" + i} x1={i * 50} y1="0" x2={i * 50} y2="800" />
        ))}
        {Array.from({ length: 17 }).map((_, i) => (
          <line key={"h" + i} x1="0" y1={i * 50} x2="800" y2={i * 50} />
        ))}
      </g>
      <path d="M0 420 Q 250 380 400 430 T 800 400" stroke="#2A3142" strokeWidth="10" fill="none" opacity="0.6" />
      <path d="M300 0 Q 340 300 420 440 T 500 800" stroke="#2A3142" strokeWidth="10" fill="none" opacity="0.6" />
      {[
        [120, 140, 90, 60], [260, 120, 60, 90], [420, 160, 100, 70], [590, 130, 70, 100],
        [100, 320, 80, 80], [560, 300, 90, 60], [670, 480, 70, 90], [140, 560, 100, 70],
        [320, 560, 70, 70], [470, 560, 90, 90], [620, 620, 60, 60], [220, 660, 80, 60],
      ].map(([x, y, w, h], i) => (
        <rect key={i} x={x} y={y} width={w} height={h} rx="6" fill="#161B26" stroke="#232838" strokeWidth="1" />
      ))}
      {bounce && (
        <circle cx={pinX} cy={pinY} r="4" fill="none" stroke={T.warm} strokeWidth="2" opacity="0.7">
          <animate attributeName="r" values="4;34;4" dur="900ms" begin="0s" fill="freeze" />
          <animate attributeName="opacity" values="0.7;0;0" dur="900ms" begin="0s" fill="freeze" />
        </circle>
      )}
      <circle cx={pinX} cy={pinY} r="7" fill={T.warm} />
      <circle cx={pinX} cy={pinY} r="16" fill={T.warm} opacity="0.25">
        <animate attributeName="r" values="10;26;10" dur="2.2s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.35;0.05;0.35" dur="2.2s" repeatCount="indefinite" />
      </circle>
    </svg>
  );
}

// ---------- Onboarding: Welcome ----------
function Welcome({ school, onNext }) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setShow(true), 150);
    return () => clearTimeout(t);
  }, []);
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center px-6" style={{ background: "#080A0E" }}>
      <div className="transition-all" style={{ opacity: show ? 1 : 0, transform: show ? "translateY(0)" : "translateY(10px)", transitionDuration: "700ms" }}>
        <div style={{ ...mono, color: T.cool }} className="text-xs tracking-widest uppercase text-center mb-3">{school}</div>
        <h1 style={{ ...display, color: T.text }} className="text-4xl md:text-5xl font-semibold text-center mb-3">Welcome to<br />College Connect</h1>
        <p style={{ color: T.muted }} className="text-sm text-center mb-10 max-w-sm mx-auto">
          Find your people on campus — by major, by sport, by whatever you're into.
        </p>
        <div className="flex justify-center">
          <PrimaryButton onClick={onNext} className="px-6 py-3 flex items-center gap-2">
            Next <ArrowRight size={15} />
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
}

// ---------- Onboarding: Profile setup ----------
function ProfileSetup({ school, userId, onComplete }) {
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

// ---------- Feature panels ----------
function initialsOf(name = "?") {
  return name.trim().split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase();
}
const AVATAR_PALETTE = ["#FF9F45", "#4FD1C5", "#8B7CF6", "#F45B69"];
function colorFor(id = "") {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) % AVATAR_PALETTE.length;
  return AVATAR_PALETTE[Math.abs(h)];
}
const YEAR_ABBR = { Freshman: "Fr", Sophomore: "So", Junior: "Jr", Senior: "Sr", "Grad Student": "Gr" };
function codeFor(major = "", year = "") {
  const initials = major.split(/\s+/).map((w) => w[0]).slice(0, 3).join("").toUpperCase();
  return `${initials}·${YEAR_ABBR[year] || ""}`;
}

function Discover({ profile, onConnect }) {
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

function FilterPill({ active, children, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: active ? T.warm : "transparent",
        color: active ? "#0A0C11" : T.muted,
        border: `1px solid ${active ? T.warm : T.border}`,
        ...mono,
      }}
      className="text-xs px-3 py-1.5 rounded-full transition-colors"
    >
      {children}
    </button>
  );
}

function Groups({ profile }) {
  const [joined, setJoined] = useState(new Set());
  const [openId, setOpenId] = useState(null);

  useEffect(() => {
    let active = true;
    (async () => {
      const { data, error } = await supabase.from("group_members").select("group_id").eq("profile_id", profile.id);
      if (active && !error) setJoined(new Set((data || []).map((r) => Number(r.group_id))));
      if (error) console.error("Group membership fetch failed:", error.message);
    })();
    return () => { active = false; };
  }, [profile.id]);

  const toggle = async (id) => {
    const isJoined = joined.has(id);
    setJoined((prev) => { const n = new Set(prev); isJoined ? n.delete(id) : n.add(id); return n; });
    if (isJoined) {
      const { error } = await supabase.from("group_members").delete().eq("group_id", String(id)).eq("profile_id", profile.id);
      if (error) console.error("Leave group failed:", error.message);
    } else {
      const { error } = await supabase.from("group_members").insert({ group_id: String(id), profile_id: profile.id });
      if (error) console.error("Join group failed:", error.message);
    }
  };

  const openGroup = GROUPS.find((g) => g.id === openId);
  if (openGroup) {
    return (
      <GroupDetail
        group={openGroup}
        joined={joined.has(openGroup.id)}
        onToggleJoin={() => toggle(openGroup.id)}
        onBack={() => setOpenId(null)}
        profile={profile}
      />
    );
  }

  return (
    <div>
      <SectionHeader eyebrow="Shared interests" title="Groups" />
      <div className="space-y-3">
        {GROUPS.map((g) => {
          const match = g.relatedInterests.filter((i) => profile.interests.includes(i));
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
                <p style={{ color: "#C6C9D4" }} className="text-sm mb-1">{g.desc}</p>
                <span style={{ ...mono, color: T.muted }} className="text-[11px]">{g.members} members</span>
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
    </div>
  );
}

function GroupDetail({ group, joined, onToggleJoin, onBack, profile }) {
  const [posts, setPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [draft, setDraft] = useState("");
  const match = group.relatedInterests.filter((i) => profile.interests.includes(i));

  const loadPosts = async () => {
    const { data, error } = await supabase
      .from("group_posts")
      .select("*")
      .eq("group_id", String(group.id))
      .order("created_at", { ascending: false });
    if (!error) setPosts(data || []);
    else console.error("Post fetch failed:", error.message);
    setLoadingPosts(false);
  };

  useEffect(() => {
    if (group.type === "discussion") loadPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [group.id]);

  const post = async () => {
    if (!draft.trim()) return;
    const text = draft.trim();
    setDraft("");
    const { error } = await supabase.from("group_posts").insert({
      group_id: String(group.id), author_id: profile.id, author_name: profile.name, text,
    });
    if (error) console.error("Post failed:", error.message);
    loadPosts();
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
            <p style={{ color: "#C6C9D4" }} className="text-sm mb-1">{group.desc}</p>
            <span style={{ ...mono, color: T.muted }} className="text-[11px]">{group.members} members</span>
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

      {group.type === "board-internships" && <Internships embedded />}
      {group.type === "board-study" && <StudyBuddies embedded />}

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

function Messages({ profile, pendingChatWith, onConsumePending }) {
  const [conversations, setConversations] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [thread, setThread] = useState([]);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(true);

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
    const interval = setInterval(() => { if (activeId) loadThread(activeId); }, 4000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeId]);

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

function Internships({ embedded = false }) {
  const [saved, setSaved] = useState(new Set());
  const toggle = (id) => setSaved((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  return (
    <div>
      {!embedded && (
        <SectionHeader eyebrow="Work & internships" title="Internship board" action={
          <PrimaryButton className="flex items-center gap-1.5 py-2"><Plus size={15} /> Post a listing</PrimaryButton>
        } />
      )}
      {embedded && (
        <div className="flex justify-end mb-4">
          <PrimaryButton className="flex items-center gap-1.5 py-2"><Plus size={15} /> Post a listing</PrimaryButton>
        </div>
      )}
      <div className="space-y-3">
        {INTERNSHIPS.map((job) => (
          <div key={job.id} style={{ background: T.surface, border: `1px solid ${T.border}` }} className="rounded-lg p-5 flex items-center justify-between gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span style={{ ...display, color: T.text }} className="font-semibold">{job.role}</span>
                <Tag tone="warm">{job.tag}</Tag>
              </div>
              <div style={{ color: "#C6C9D4" }} className="text-sm mb-1">{job.org} · {job.location} · {job.term}</div>
              <span style={{ ...mono, color: T.muted }} className="text-[11px]">Posted by {job.postedBy}</span>
            </div>
            <button
              onClick={() => toggle(job.id)}
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
    </div>
  );
}

function StudyBuddies({ embedded = false }) {
  return (
    <div>
      {!embedded && (
        <SectionHeader eyebrow="Find a study pod" title="Study buddies" action={
          <PrimaryButton className="flex items-center gap-1.5 py-2"><Plus size={15} /> Post a request</PrimaryButton>
        } />
      )}
      {embedded && (
        <div className="flex justify-end mb-4">
          <PrimaryButton className="flex items-center gap-1.5 py-2"><Plus size={15} /> Post a request</PrimaryButton>
        </div>
      )}
      <div className="space-y-3">
        {STUDY_REQUESTS.map((r) => (
          <div key={r.id} style={{ background: T.surface, border: `1px solid ${T.border}` }} className="rounded-lg p-5">
            <div className="flex items-center justify-between mb-2">
              <span style={{ ...display, color: T.text }} className="font-semibold">{r.course}</span>
              <Tag>{r.school}</Tag>
            </div>
            <p style={{ color: "#C6C9D4" }} className="text-sm mb-3">{r.note}</p>
            <div className="flex items-center justify-between">
              <span style={{ ...mono, color: T.muted }} className="text-[11px] flex items-center gap-1"><Clock size={11} /> {r.when} · posted by {r.postedBy}</span>
              <PrimaryButton className="px-4 py-1.5">Join</PrimaryButton>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Profile({ profile, onUpdate }) {
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

// ---------- App shell ----------
export default function CollegeConnect() {
  const [stage, setStage] = useState("restoring"); // restoring -> auth -> map -> welcome -> setup -> app
  const [school, setSchool] = useState("");
  const [userId, setUserId] = useState(null);
  const [profile, setProfile] = useState(null);
  const [tab, setTab] = useState("discover");
  const [pendingChatWith, setPendingChatWith] = useState(null);

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

  const connectWith = (person) => { setPendingChatWith(person); setTab("messages"); };

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

  const panel = {
    discover: <Discover profile={profile} onConnect={connectWith} />,
    groups: <Groups profile={profile} />,
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
            const isActive = tab === n.id;
            return (
              <button
                key={n.id} onClick={() => setTab(n.id)}
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
          const isActive = tab === n.id;
          return (
            <button key={n.id} onClick={() => setTab(n.id)} style={{ color: isActive ? T.warm : T.muted }} className="p-2 rounded-md">
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
            <input placeholder="Search students, groups, courses..." style={{ color: T.text }} className="flex-1 bg-transparent text-sm outline-none placeholder:text-[#5B5F6E]" />
          </div>
          {panel}
        </div>
      </main>
    </div>
  );
}
