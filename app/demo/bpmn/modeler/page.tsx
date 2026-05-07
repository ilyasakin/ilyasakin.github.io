"use client";

import dynamic from "next/dynamic";

const ModelerDemo = dynamic(() => import("./modeler-demo"), { ssr: false });

export default function Page() {
  return <ModelerDemo />;
}
