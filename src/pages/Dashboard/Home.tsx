import PageMeta from "../../components/common/PageMeta";
import VerificationMetrics from "../../components/verification/VerificationMetrics";
import RecentTickets from "../../components/verification/RecentTickets";

export default function Home() {
  return (
    <>
      <PageMeta
        title="ARIES Verification Dashboard"
        description="Modern Warships Verification Admin Dashboard"
      />
      <div className="grid grid-cols-12 gap-4 md:gap-6">
        <div className="col-span-12">
          <VerificationMetrics />
        </div>

        <div className="col-span-12">
          <RecentTickets />
        </div>
      </div>
    </>
  );
}
