import {
  Users, MessageCircle, User, Compass,
  Dumbbell, Music, Palette, Gamepad2, Brain, Coffee,
} from "lucide-react";

export const NAV = [
  { id: "discover", label: "Discover", icon: Compass },
  { id: "groups", label: "Groups", icon: Users },
  { id: "messages", label: "Messages", icon: MessageCircle },
  { id: "profile", label: "Profile", icon: User },
];

export const INTEREST_CATEGORIES = [
  { name: "Sports & Fitness", icon: Dumbbell, options: ["Basketball", "Soccer", "Football", "Volleyball", "Tennis", "Swimming", "Running", "Rock Climbing", "Baseball", "Golf", "Hockey", "Yoga", "Cycling", "Esports"] },
  { name: "Music", icon: Music, options: ["Jazz", "Hip-Hop", "Rock", "Pop", "Classical", "EDM", "Country", "Indie", "R&B", "Vinyl Collecting"] },
  { name: "Arts & Media", icon: Palette, options: ["Photography", "Film", "Theater", "Dance", "Painting", "Writing", "Fashion"] },
  { name: "Gaming & Tech", icon: Gamepad2, options: ["Video Games", "Hackathons", "Robotics", "Startups", "Coding"] },
  { name: "Academic & Career", icon: Brain, options: ["Debate", "Research", "Volunteering", "Entrepreneurship"] },
  { name: "Lifestyle", icon: Coffee, options: ["Chess", "Cooking", "Travel", "Coffee", "Podcasts", "Reading"] },
];

export const YEARS = ["Freshman", "Sophomore", "Junior", "Senior", "Grad Student"];
export const YEAR_ABBR = { Freshman: "Fr", Sophomore: "So", Junior: "Jr", Senior: "Sr", "Grad Student": "Gr" };

export const GROUP_TAGS = ["Academic", "Sports", "Creative", "Community", "Career", "Study", "Other"];
export const INTERNSHIP_TAGS = ["Tech", "Business", "Research", "Engineering", "Design", "Other"];
