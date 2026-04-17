"use client";

import { DataTable, type ColumnDef } from "@weiui/react/data-table";

type User = {
  name: string;
  email: string;
  role: string;
};

const users: User[] = [
  { name: "Ada Lovelace", email: "ada@example.com", role: "Admin" },
  { name: "Alan Turing", email: "alan@example.com", role: "Engineer" },
  { name: "Grace Hopper", email: "grace@example.com", role: "Engineer" },
  { name: "Linus Torvalds", email: "linus@example.com", role: "Admin" },
  { name: "Margaret Hamilton", email: "margaret@example.com", role: "Designer" },
];

const columns: ColumnDef<User>[] = [
  { accessorKey: "name", header: "Name" },
  { accessorKey: "email", header: "Email" },
  { accessorKey: "role", header: "Role" },
];

export default function DataTableDemoInner() {
  return (
    <div style={{ inlineSize: "100%" }}>
      <DataTable data={users} columns={columns} searchable pageSize={5} />
    </div>
  );
}
