import React, { Suspense, ComponentType } from "react";
import LoadingPage from "@/components/shared/LoadingPage";

interface LazyPageProps {
  component: ComponentType<any>;
  componentProps?: Record<string, any>;
}

const LazyPage: React.FC<LazyPageProps> = ({ component: Component, componentProps = {} }) => {
  return (
    <Suspense fallback={<LoadingPage />}>
      <Component {...componentProps} />
    </Suspense>
  );
};

export default LazyPage;
