export function getSessionId(): string {
  let sessionId = localStorage.getItem("aksantimed_session_id");
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    localStorage.setItem("aksantimed_session_id", sessionId);
  }
  return sessionId;
}
