import React, { Suspense, ComponentType } from "react";
import LoadingPage from "@/components/shared/LoadingPage";

interface LazyPageProps {
  component: ComponentType;
}

const LazyPage: React.FC<LazyPageProps> = ({ component: Component }) => {
  return (
    <Suspense fallback={<LoadingPage />}>
      <Component />
    </Suspense>
  );
};

export default LazyPage;
