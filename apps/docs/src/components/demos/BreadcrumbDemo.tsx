"use client";

import { Breadcrumb, BreadcrumbItem, BreadcrumbSeparator, Link } from "civaria";

export function BreadcrumbDemo() {
  return (
    <Breadcrumb>
      <BreadcrumbItem>
        <Link href="#home">Home</Link>
      </BreadcrumbItem>
      <BreadcrumbSeparator />
      <BreadcrumbItem>
        <Link href="#products">Products</Link>
      </BreadcrumbItem>
      <BreadcrumbSeparator />
      <BreadcrumbItem active>Detail</BreadcrumbItem>
    </Breadcrumb>
  );
}
