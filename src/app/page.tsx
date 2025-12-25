"use client";

import { AppLayout } from "@/components/AppLayout";
import { MainPanel } from "@/components/MainPanel";
import { useViewContext } from "@/contexts/ViewContext";

export default function Home() {
  const { state: viewState } = useViewContext();

  return (
    <AppLayout>
      <MainPanel 
        title={viewState.currentView.charAt(0).toUpperCase() + viewState.currentView.slice(1)}
        view={viewState.currentView}
      />
    </AppLayout>
  );
}
