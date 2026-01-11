import { useEffect, useReducer } from "react";

/* ---------- TYPES (mental model) ----------
MediaItem:
{
  id,
  tmdb_id,
  media_type: "movie" | "tv",
  title,
  year,
  poster_path,
  status,
  rating,
  dateAdded,
  meta: {}
}
------------------------------------------ */

const STORAGE_KEY = "movieLog_v2_media";

/* ---------- HELPERS ---------- */
const loadInitialState = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

/* ---------- REDUCER ---------- */
function mediaReducer(state, action) {
  switch (action.type) {
    case "ADD_MEDIA":
      // prevent duplicates (same tmdb_id + type)
      if (
        state.some(
          m =>
            m.tmdb_id === action.payload.tmdb_id &&
            m.media_type === action.payload.media_type
        )
      ) {
        return state;
      }
      return [action.payload, ...state];

    case "UPDATE_STATUS":
      return state.map(m =>
        m.id === action.payload.id
          ? { ...m, status: action.payload.status }
          : m
      );

    case "RATE_MEDIA":
      return state.map(m =>
        m.id === action.payload.id
          ? { ...m, rating: action.payload.rating }
          : m
      );

    case "REMOVE_MEDIA":
      return state.filter(m => m.id !== action.payload.id);

    case "IMPORT_MEDIA":
      return action.payload;

    default:
      return state;
  }
}

/* ---------- HOOK ---------- */
export function useMediaStore() {
  const [media, dispatch] = useReducer(
    mediaReducer,
    [],
    loadInitialState
  );

  // persist
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(media));
  }, [media]);

  /* ---------- ACTIONS ---------- */
  const addMedia = item =>
    dispatch({ type: "ADD_MEDIA", payload: item });

  const updateStatus = (id, status) =>
    dispatch({ type: "UPDATE_STATUS", payload: { id, status } });

  const rateMedia = (id, rating) =>
    dispatch({ type: "RATE_MEDIA", payload: { id, rating } });

  const removeMedia = id =>
    dispatch({ type: "REMOVE_MEDIA", payload: { id } });

  const importMedia = items =>
    dispatch({ type: "IMPORT_MEDIA", payload: items });

  return {
    media,
    addMedia,
    updateStatus,
    rateMedia,
    removeMedia,
    importMedia
  };
}
