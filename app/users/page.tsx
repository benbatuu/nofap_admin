import { DataTable } from "@/components/ui/data-table";
import data from "@/components/data.json";

export default function Page() {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4">
        <div className="grid auto-rows-min gap-4 md:grid-cols-3">
          <p className="text-2xl font-semibold">Users</p>
        </div>
        <DataTable data={data} />
      </div>
    )
  }