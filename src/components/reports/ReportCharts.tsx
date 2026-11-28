"use client";

import { ReactNode } from "react";
import { format, parseISO } from "date-fns";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from "recharts";
import { Symptom, WeightEntry } from "@/types/report";

// Solid Mint palette (no gradients).
const C = {
  deep: "#0E7A4A",
  mint: "#38CD83",
  leaf: "#16A866",
  coral: "#FF6F61",
  amber: "#F6B93B",
  sky: "#3FA7D6",
  grape: "#9B6ED8",
  pink: "#FF5C9A",
  orange: "#F5833E",
  hair: "#E1EDE6",
  muted: "#5E7A6E",
};

const SERIES = [
  C.deep,
  C.mint,
  C.sky,
  C.amber,
  C.coral,
  C.grape,
  C.pink,
  C.orange,
  C.leaf,
];

export function ChartCard({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="bg-surface rounded-card border border-hair p-4">
      <h3 className="text-sm font-bold text-ink mb-3">{title}</h3>
      {children}
    </div>
  );
}

function Empty({ label }: { label: string }) {
  return (
    <div className="flex h-[200px] items-center justify-center">
      <p className="text-sm text-muted">{label}</p>
    </div>
  );
}

export function WeightChart({
  entries,
  emptyLabel,
  unitLabel,
}: {
  entries: WeightEntry[];
  emptyLabel: string;
  unitLabel: string;
}) {
  if (!entries.length) return <Empty label={emptyLabel} />;
  const data = entries.map((e) => ({
    date: format(parseISO(e.measuredAt), "dd/MM/yy"),
    weight: e.weight,
  }));
  return (
    <div style={{ width: "100%", height: 220 }}>
      <ResponsiveContainer>
        <LineChart data={data} margin={{ top: 8, right: 12, left: -8, bottom: 0 }}>
          <CartesianGrid stroke={C.hair} vertical={false} />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11, fill: C.muted }}
            tickLine={false}
            axisLine={{ stroke: C.hair }}
          />
          <YAxis
            tick={{ fontSize: 11, fill: C.muted }}
            tickLine={false}
            axisLine={false}
            width={34}
            unit={unitLabel}
          />
          <Tooltip
            contentStyle={{
              borderRadius: 12,
              border: `1px solid ${C.hair}`,
              fontSize: 12,
            }}
          />
          <Line
            type="monotone"
            dataKey="weight"
            stroke={C.deep}
            strokeWidth={2}
            dot={{ r: 3, fill: C.deep }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function SymptomFrequencyChart({
  symptoms,
  emptyLabel,
}: {
  symptoms: Symptom[];
  emptyLabel: string;
}) {
  if (!symptoms.length) return <Empty label={emptyLabel} />;
  const sorted = [...symptoms].sort((a, b) =>
    a.observedAt.localeCompare(b.observedAt)
  );
  const map = new Map<string, { label: string; count: number }>();
  sorted.forEach((s) => {
    const d = parseISO(s.observedAt);
    const key = format(d, "yyyy-MM");
    const existing = map.get(key);
    if (existing) existing.count += 1;
    else map.set(key, { label: format(d, "MMM/yy"), count: 1 });
  });
  const data = [...map.values()];
  return (
    <div style={{ width: "100%", height: 220 }}>
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 8, right: 12, left: -8, bottom: 0 }}>
          <CartesianGrid stroke={C.hair} vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 11, fill: C.muted }}
            tickLine={false}
            axisLine={{ stroke: C.hair }}
          />
          <YAxis
            allowDecimals={false}
            tick={{ fontSize: 11, fill: C.muted }}
            tickLine={false}
            axisLine={false}
            width={28}
          />
          <Tooltip
            cursor={{ fill: C.hair, opacity: 0.4 }}
            contentStyle={{
              borderRadius: 12,
              border: `1px solid ${C.hair}`,
              fontSize: 12,
            }}
          />
          <Bar dataKey="count" fill={C.deep} radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// Horizontal bar chart of category counts, one color per bar.
function HorizontalBars({
  data,
}: {
  data: { label: string; count: number }[];
}) {
  return (
    <div style={{ width: "100%", height: Math.max(220, data.length * 36) }}>
      <ResponsiveContainer>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 4, right: 16, left: 8, bottom: 4 }}
        >
          <CartesianGrid stroke={C.hair} horizontal={false} />
          <XAxis
            type="number"
            allowDecimals={false}
            tick={{ fontSize: 11, fill: C.muted }}
            tickLine={false}
            axisLine={{ stroke: C.hair }}
          />
          <YAxis
            type="category"
            dataKey="label"
            tick={{ fontSize: 11, fill: C.muted }}
            tickLine={false}
            axisLine={false}
            width={96}
          />
          <Tooltip
            cursor={{ fill: C.hair, opacity: 0.4 }}
            contentStyle={{
              borderRadius: 12,
              border: `1px solid ${C.hair}`,
              fontSize: 12,
            }}
          />
          <Bar dataKey="count" radius={[0, 6, 6, 0]}>
            {data.map((_, i) => (
              <Cell key={i} fill={SERIES[i % SERIES.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function countByType(
  items: { type: string }[],
  labelFor: (type: string) => string
) {
  const counts: Record<string, number> = {};
  items.forEach((i) => {
    counts[i.type] = (counts[i.type] || 0) + 1;
  });
  return Object.entries(counts)
    .map(([type, count]) => ({ label: labelFor(type), count }))
    .sort((a, b) => b.count - a.count);
}

export function SymptomDistributionChart({
  symptoms,
  labelFor,
  emptyLabel,
}: {
  symptoms: Symptom[];
  labelFor: (type: string) => string;
  emptyLabel: string;
}) {
  if (!symptoms.length) return <Empty label={emptyLabel} />;
  return <HorizontalBars data={countByType(symptoms, labelFor)} />;
}

export function EventTypeChart({
  events,
  labelFor,
  emptyLabel,
}: {
  events: { type: string }[];
  labelFor: (type: string) => string;
  emptyLabel: string;
}) {
  if (!events.length) return <Empty label={emptyLabel} />;
  return <HorizontalBars data={countByType(events, labelFor)} />;
}
