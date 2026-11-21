"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

type CalendarEvent = { title: string; slug: string; startsAt: string; isDemo: boolean };
const weekdays = ["Lun", "Mar", "Mer", "Gio", "Ven", "Sab", "Dom"];

export function EventCalendar({ events }: { events: CalendarEvent[] }) {
  const [visibleMonth, setVisibleMonth] = useState(() => { const now = new Date(); return new Date(now.getFullYear(), now.getMonth(), 1); });
  const cells = useMemo(() => {
    const year = visibleMonth.getFullYear();
    const month = visibleMonth.getMonth();
    const first = new Date(year, month, 1);
    const mondayOffset = (first.getDay() + 6) % 7;
    const start = new Date(year, month, 1 - mondayOffset);
    return Array.from({ length: 42 }, (_, index) => new Date(start.getFullYear(), start.getMonth(), start.getDate() + index));
  }, [visibleMonth]);
  const move = (amount: number) => setVisibleMonth(new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + amount, 1));
  const dateKey = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2,"0")}-${String(date.getDate()).padStart(2,"0")}`;

  return <div>
    <div className="mb-4 flex items-center justify-between gap-3">
      <button className="btn btn-outline btn-small" onClick={() => move(-1)} aria-label="Mese precedente"><ChevronLeft size={18} /></button>
      <h2 className="display m-0 text-2xl" aria-live="polite">{new Intl.DateTimeFormat("it-IT", { month: "long", year: "numeric" }).format(visibleMonth)}</h2>
      <button className="btn btn-outline btn-small" onClick={() => move(1)} aria-label="Mese successivo"><ChevronRight size={18} /></button>
    </div>
    <div className="calendar-grid">
      {weekdays.map((day) => <div className="calendar-cell calendar-head" key={day}>{day}</div>)}
      {cells.map((date) => {
        const key = dateKey(date);
        const dayEvents = events.filter((event) => event.startsAt.slice(0,10) === key);
        return <div className={`calendar-cell ${date.getMonth() !== visibleMonth.getMonth() ? "outside" : ""}`} key={key}>
          <span className="calendar-day">{date.getDate()}</span>
          {dayEvents.map((event) => <Link className="calendar-event" href={`/eventi/${event.slug}`} key={event.slug} title={`${event.title}${event.isDemo ? " (DEMO)" : ""}`}>{event.title}</Link>)}
        </div>;
      })}
    </div>
  </div>;
}
