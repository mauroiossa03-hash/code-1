/*
  Astrazione provider video. Per ora usiamo Supabase Storage con signed URL,
  ma l'interfaccia è pensata per poter aggiungere bunny/mux/vimeo senza
  toccare i componenti player.

  getLessonSource({ provider, videoId }) -> Promise<{ kind, src }>
    kind: "file"  -> usare un tag <video src>
    kind: "iframe"-> usare un <iframe src> (bunny/mux/vimeo embed)

  Per Supabase: `videoId` è il path dell'oggetto dentro il bucket "course-videos".
*/
import { supabase } from "./supabase.js";

const SUPABASE_BUCKET = "course-videos";
const SIGNED_URL_TTL = 60 * 60 * 4; // 4 ore

export async function getLessonSource({ provider, videoId }) {
  switch (provider) {
    case "supabase": {
      const { data, error } = await supabase
        .storage
        .from(SUPABASE_BUCKET)
        .createSignedUrl(videoId, SIGNED_URL_TTL);
      if (error) throw error;
      return { kind: "file", src: data.signedUrl };
    }
    case "bunny":
      // Bunny Stream embed (libraryId/videoId nel formato "<libraryId>/<guid>")
      return { kind: "iframe", src: `https://iframe.mediadelivery.net/embed/${videoId}` };
    case "mux":
      return { kind: "iframe", src: `https://player.mux.com/${videoId}` };
    case "vimeo":
      return { kind: "iframe", src: `https://player.vimeo.com/video/${videoId}` };
    default:
      throw new Error(`Provider video non supportato: ${provider}`);
  }
}
