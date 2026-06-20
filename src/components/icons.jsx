import {
  Scale, Sigma, TrendingUp, ClipboardList, Building2, BarChart3,
  Landmark, Repeat, Gem, Target,
} from "lucide-react";

/* Map a topic's `icon` key (from data.js) to a Lucide component. */
const TOPIC_ICONS = {
  scale: Scale,
  sigma: Sigma,
  trending: TrendingUp,
  clipboard: ClipboardList,
  building: Building2,
  barchart: BarChart3,
  landmark: Landmark,
  repeat: Repeat,
  gem: Gem,
  target: Target,
};

export function TopicIcon({ name, size = 20, color = "currentColor", strokeWidth = 2 }) {
  const Icon = TOPIC_ICONS[name] || Target;
  return <Icon size={size} color={color} strokeWidth={strokeWidth} />;
}

/* Re-export the icons used across screens so imports stay tidy. */
export {
  LayoutGrid, HelpCircle, Layers3, FileText, Crown, User, Globe, Lock,
  ChevronRight, ChevronLeft, ArrowRight, ArrowLeft, Check, X, Eye, EyeOff,
  Mail, Sparkles, Clock, ShieldCheck, Zap, Brain, Timer, Flame, CalendarDays,
  LogOut, KeyRound, Star, CheckCircle2, AlertTriangle, BarChart3, Target,
  TrendingUp, GraduationCap, Rocket, Gauge, BookOpen, Wand2, PartyPopper,
} from "lucide-react";
