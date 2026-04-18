"use client";

import { DataTable, type ColumnDef } from "@weiui/react/data-table";
import { Badge } from "@weiui/react";

type User = {
  name: string;
  email: string;
  role: "Admin" | "Engineer" | "Designer" | "PM";
  status: "active" | "invited" | "paused";
};

const users: User[] = [
  { name: "Ada Lovelace", email: "ada@example.com", role: "Admin", status: "active" },
  { name: "Alan Turing", email: "alan@example.com", role: "Engineer", status: "active" },
  { name: "Grace Hopper", email: "grace@example.com", role: "Engineer", status: "active" },
  { name: "Linus Torvalds", email: "linus@example.com", role: "Admin", status: "paused" },
  { name: "Margaret Hamilton", email: "margaret@example.com", role: "Designer", status: "active" },
  { name: "Katherine Johnson", email: "katherine@example.com", role: "Engineer", status: "active" },
  { name: "Dennis Ritchie", email: "dennis@example.com", role: "Engineer", status: "invited" },
  { name: "Barbara Liskov", email: "barbara@example.com", role: "PM", status: "active" },
  { name: "Donald Knuth", email: "donald@example.com", role: "Engineer", status: "paused" },
  { name: "Sophie Wilson", email: "sophie@example.com", role: "Designer", status: "invited" },
  { name: "Radia Perlman", email: "radia@example.com", role: "Engineer", status: "active" },
  { name: "Brian Kernighan", email: "brian@example.com", role: "PM", status: "active" },
];

const statusColor: Record<User["status"], "success" | "warning" | "primary"> = {
  active: "success",
  invited: "warning",
  paused: "primary",
};

const columns: ColumnDef<User>[] = [
  { accessorKey: "name", header: "Name" },
  { accessorKey: "email", header: "Email" },
  { accessorKey: "role", header: "Role" },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status;
      return (
        <Badge variant="soft" color={statusColor[status]}>
          {status}
        </Badge>
      );
    },
  },
];

export default function DataTableDemoInner() {
  return (
    <div style={{ inlineSize: "100%" }}>
      <DataTable
        data={users}
        columns={columns}
        searchable
        searchPlaceholder="Search people..."
        selectable
        pageSize={5}
      />
    </div>
  );
}
