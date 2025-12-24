import React from "react";
import { Card } from "../components/ui/Card";
import { Car } from "lucide-react";

export function Dashboard() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Card className="p-5">
        <div className="text-xs text-white/55">Snapshot</div>
        <div className="mt-1 text-lg font-semibold">Month-to-date</div>
        <div className="mt-3 text-sm text-white/60">
          Next step: import transactions and calculate income/spend/net.
        </div>
      </Card>

      <Card className="p-5">
        <div className="text-xs text-white/55">Bills</div>
        <div className="mt-1 text-lg font-semibold">Upcoming</div>
        <div className="mt-3 text-sm text-white/60">
          Next step: build the monthly bills calendar.
        </div>
      </Card>
    </div>
  );
}
