"use client";

import { useState } from "react";

export function ContactForm({ clientId, brandColour }: { clientId: string; brandColour: string }) {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function onSubmit(formData: FormData) {
    setStatus("sending");
    const response = await fetch("/api/enquiries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        clientId,
        name: formData.get("name"),
        phone: formData.get("phone"),
        service: formData.get("service"),
        suburb: formData.get("suburb"),
        message: formData.get("message")
      })
    });
    setStatus(response.ok ? "sent" : "error");
  }

  return (
    <form action={onSubmit} className="rounded-lg border border-line bg-white p-5">
      <h2 className="text-3xl font-bold">Get a free quote</h2>
      {["Name", "Phone", "Service", "Suburb"].map((field) => (
        <label key={field} className="mt-4 block text-sm font-semibold">
          {field}
          <input name={field.toLowerCase()} required className="mt-2 w-full rounded-md border border-line px-3 py-2" />
        </label>
      ))}
      <label className="mt-4 block text-sm font-semibold">
        Message
        <textarea name="message" className="mt-2 min-h-24 w-full rounded-md border border-line px-3 py-2" />
      </label>
      <button className="mt-5 rounded-md px-5 py-3 font-semibold text-white" style={{ backgroundColor: brandColour }}>
        {status === "sending" ? "Sending" : status === "sent" ? "Sent" : "Send enquiry"}
      </button>
      {status === "error" && <p className="mt-3 text-sm font-semibold text-red-600">Could not send enquiry.</p>}
    </form>
  );
}
