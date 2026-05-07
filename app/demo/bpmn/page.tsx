"use client";

import dynamic from "next/dynamic";

const ViewerDemo = dynamic(() => import("./viewer-demo"), { ssr: false });

export default function Page() {
  return <ViewerDemo />;
}
