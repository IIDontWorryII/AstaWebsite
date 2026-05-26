// client/src/pages/admin/NewEvent.tsx
//
// Thin wrapper around EventForm in "create" mode (no event prop).
// Exists as a separate page so the route can be named clearly and so
// we have a single place to add page-level concerns later (e.g. a
// "Are you sure you want to leave?" prompt if the form is dirty).

import EventForm from "./EventForm";

export default function NewEvent() {
  return <EventForm />;
}
