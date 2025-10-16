import { DashboardLayout } from "@/components/DashboardLayout";
import { AftercareManager } from "@/components/aftercare/AftercareManager";

const AftercareGuides = () => {
  return (
    <DashboardLayout>
      <div className="container max-w-7xl py-8">
        <AftercareManager />
      </div>
    </DashboardLayout>
  );
};

export default AftercareGuides;
