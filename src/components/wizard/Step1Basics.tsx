import React from "react";
import { EVENT_TYPES } from "../../../shared/constants.js";
import type { EventType } from "../../../shared/types.js";

interface Step1BasicsProps {
  eventType: EventType;
  setEventType: (t: EventType) => void;
  name: string;
  setName: (n: string) => void;
  date: string;
  setDate: (d: string) => void;
  city: string;
  setCity: (c: string) => void;
  onNext: () => void;
}

function EventTypeRadioGroup({
  currentType,
  onChange,
}: {
  currentType: EventType;
  onChange: (t: EventType) => void;
}): React.JSX.Element {
  return (
    <fieldset className="border border-slate-300 p-4 rounded">
      <legend className="font-semibold text-sm text-slate-900 px-1">Select Event Type</legend>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-2">
        {EVENT_TYPES.map((type) => (
          <label
            key={type}
            className={`min-h-[44px] flex items-center gap-3 p-3 border rounded cursor-pointer transition-colors ${
              currentType === type ? "border-teal-700 bg-teal-50" : "border-slate-300 hover:bg-slate-50"
            }`}
          >
            <input
              type="radio"
              name="eventType"
              value={type}
              checked={currentType === type}
              onChange={() => onChange(type)}
              className="w-5 h-5 text-teal-700"
            />
            <span className="font-medium capitalize text-slate-900">{type}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function DateAndCityFields({
  date,
  setDate,
  city,
  setCity,
}: {
  date: string;
  setDate: (d: string) => void;
  city: string;
  setCity: (c: string) => void;
}): React.JSX.Element {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div>
        <label htmlFor="eventDate" className="block text-sm font-semibold text-slate-900 mb-1">Event Date</label>
        <input
          id="eventDate"
          type="date"
          required
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full min-h-[44px] px-3 py-2 border border-slate-300 rounded focus:border-teal-700 text-slate-900"
        />
      </div>
      <div>
        <label htmlFor="eventCity" className="block text-sm font-semibold text-slate-900 mb-1">Location / City</label>
        <input
          id="eventCity"
          type="text"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="e.g. Portland, OR"
          className="w-full min-h-[44px] px-3 py-2 border border-slate-300 rounded focus:border-teal-700 text-slate-900"
        />
      </div>
    </div>
  );
}

export function Step1Basics({
  eventType,
  setEventType,
  name,
  setName,
  date,
  setDate,
  city,
  setCity,
  onNext,
}: Step1BasicsProps): React.JSX.Element {
  return (
    <div className="space-y-6">
      <EventTypeRadioGroup currentType={eventType} onChange={setEventType} />
      <div>
        <label htmlFor="eventName" className="block text-sm font-semibold text-slate-900 mb-1">Event Name</label>
        <input
          id="eventName"
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Maya & Liam's Wedding"
          className="w-full min-h-[44px] px-3 py-2 border border-slate-300 rounded focus:border-teal-700 text-slate-900"
        />
      </div>
      <DateAndCityFields date={date} setDate={setDate} city={city} setCity={setCity} />
      <div className="flex justify-end pt-4">
        <button
          type="button"
          onClick={onNext}
          className="min-h-[44px] px-6 py-2 bg-teal-700 text-white font-semibold rounded hover:bg-teal-800"
        >
          Continue to Budget & Guests
        </button>
      </div>
    </div>
  );
}
