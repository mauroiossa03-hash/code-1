import { useState, useEffect } from "react";
import { Navigate, useLocation, useParams } from "react-router-dom";
import { isEnrolledBySlug } from "../data/courses.js";
import { Spinner } from "./primitives.jsx";

/*
  Protegge il player lezione: richiede login + enrollment valido sul corso
  (slug preso dai params di route). Se non loggato -> /login?next=...,
  se loggato ma non iscritto -> torna alla pagina del corso.
*/
export default function EnrolledRoute({ user, children }) {
  const location = useLocation();
  const { slug } = useParams();
  const [state, setState] = useState("checking"); // checking | ok | denied

  useEffect(() => {
    let cancelled = false;
    if (!user) { setState("denied"); return; }
    setState("checking");
    isEnrolledBySlug(slug)
      .then((ok) => { if (!cancelled) setState(ok ? "ok" : "denied"); })
      .catch(() => { if (!cancelled) setState("denied"); });
    return () => { cancelled = true; };
  }, [user, slug]);

  if (!user) {
    return <Navigate to={`/login?next=${encodeURIComponent(location.pathname)}`} replace />;
  }
  if (state === "checking") return <Spinner pad={120} />;
  if (state === "denied") return <Navigate to={`/corsi/${slug}`} replace />;
  return children;
}
