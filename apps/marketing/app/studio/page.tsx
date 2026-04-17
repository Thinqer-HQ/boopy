"use client";

import { useMemo, useState } from "react";
import { Data, Puck, Render } from "@measured/puck";
import "@measured/puck/puck.css";

const defaultData: Data = {
  root: {
    props: {},
  },
  content: [
    {
      type: "Hero",
      props: {
        title: "Boopy is your comprehensive subscription manager.",
        subtitle:
          "Personal users, groups, agencies, and businesses can all track subscriptions in one command center.",
        ctaLabel: "Start free",
        ctaUrl: "https://app.boopy.dev/login",
      },
    },
  ],
};

export default function StudioPage() {
  const [mode, setMode] = useState<"edit" | "preview">("edit");
  const [data, setData] = useState<Data>(defaultData);

  const config = useMemo(
    () => ({
      components: {
        Hero: {
          fields: {
            title: { type: "text" },
            subtitle: { type: "textarea" },
            ctaLabel: { type: "text" },
            ctaUrl: { type: "text" },
          },
          defaultProps: {
            title: "Boopy is your comprehensive subscription manager.",
            subtitle:
              "Personal users, groups, agencies, and businesses can all track subscriptions in one command center.",
            ctaLabel: "Start free",
            ctaUrl: "https://app.boopy.dev/login",
          },
          render: (props: {
            title?: string;
            subtitle?: string;
            ctaLabel?: string;
            ctaUrl?: string;
          }) => (
            <section className="card" style={{ margin: "1rem 0" }}>
              <h2 style={{ marginTop: 0 }}>{props.title ?? "Landing section"}</h2>
              <p style={{ color: "#4d4d4d", lineHeight: 1.6 }}>{props.subtitle ?? ""}</p>
              <a className="btn btn-primary" href={props.ctaUrl ?? "#"}>
                {props.ctaLabel ?? "Learn more"}
              </a>
            </section>
          ),
        },
      },
    }),
    []
  );

  return (
    <main className="editor-page">
      <div className="editor-shell">
        <div style={{ display: "flex", gap: "0.6rem", marginBottom: "0.8rem" }}>
          <button className="btn btn-outline" onClick={() => setMode("edit")} type="button">
            Edit
          </button>
          <button className="btn btn-outline" onClick={() => setMode("preview")} type="button">
            Preview
          </button>
          <button
            className="btn btn-outline"
            onClick={() => navigator.clipboard.writeText(JSON.stringify(data, null, 2))}
            type="button"
          >
            Copy JSON
          </button>
        </div>
        {mode === "edit" ? (
          <Puck config={config as never} data={data} onPublish={(nextData) => setData(nextData)} />
        ) : (
          <Render config={config as never} data={data} />
        )}
      </div>
    </main>
  );
}
