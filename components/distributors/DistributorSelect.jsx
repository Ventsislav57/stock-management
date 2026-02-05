"use client";

import { useEffect, useMemo, useState } from "react";

export default function DistributorSelect({ value, onChange, className = "" }) {
    const [items, setItems] = useState([]);
    const [defaultId, setDefaultId] = useState(null);
    const [loading, setLoading] = useState(true);
    const selected = value ?? "";

    useEffect(() => {
        let alive = true;

        (async () => {
            try {
                setLoading(true);
                const res = await fetch("/api/distributors", { cache: "no-store" });
                const data = await res.json();

                if (!alive) return;

                const list = data?.items ?? [];
                setItems(list);
                setDefaultId(data?.defaultDistributorId ?? list[0]?.id ?? null);
            } catch (e) {
                console.error("Failed to load distributors:", e);
            } finally {
                if (alive) setLoading(false);
            }
        })();

        return () => {
            alive = false;
        };
    }, []);

    const canSelect = useMemo(() => items.length > 0, [items]);

    return (
        <div className={`flex items-center gap-3 ${className}`}>
            <div className="text-sm text-white/80">Дистрибутор:</div>

            <select
                value={selected || defaultId || ""}
                disabled={!canSelect || loading}
                onChange={(e) => onChange?.(e.target.value)}
                className="bg-slate-900 text-white border border-slate-700 rounded px-3 py-2 min-w-[260px]"
            >
                {!canSelect ? <option value="">(няма дистрибутори)</option> : null}
                {items.map((d) => (
                    <option key={d.id} value={d.id}>
                        {d.name}
                    </option>
                ))}
            </select>

            {loading ? <div className="text-xs text-white/60">зареждане…</div> : null}
        </div>
    );
}
