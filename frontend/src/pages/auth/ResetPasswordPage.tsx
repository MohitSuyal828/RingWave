import UnsupportedFeatureBanner from "@/components/UnsupportedFeatureBanner";

// NOTE: The backend has no reset-password endpoint. This page is a stub
// left untouched — see integration audit.
const ResetPasswordPage = () => (
  <div className="text-foreground p-6 space-y-4">
    <UnsupportedFeatureBanner message="Password reset isn't implemented by the current backend yet." />
    <div>Reset Password</div>
  </div>
);
export default ResetPasswordPage;
