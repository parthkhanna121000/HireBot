import { useState, useCallback } from "react";

/**
 * usePlanLimit — wrap any API call that might return a plan limit 403.
 *
 * Usage in any feature page:
 *
 *   import usePlanLimit from "../../../shared/hooks/usePlanLimit";
 *   import UpgradeModal from "../../../shared/UpgradeModal";
 *
 *   const { call, upgradeModal } = usePlanLimit();
 *
 *   const handleAnalyze = async () => {
 *     const data = await call(() => analyzeResumeApi(resumeFile, jdText));
 *     if (data) setResults(data); // only runs if not blocked
 *   };
 *
 *   return (
 *     <>
 *       <button onClick={handleAnalyze}>Analyze</button>
 *       {upgradeModal}
 *     </>
 *   );
 */

import UpgradeModal from "../UpgradeModal";

export default function usePlanLimit() {
  const [limitFeature, setLimitFeature] = useState(null); // which feature was blocked

  /**
   * Wrap an async API call. If the server responds with 403 + upgradeRequired,
   * show the upgrade modal instead of propagating the error.
   * Returns the result on success, null if blocked.
   */
  const call = useCallback(async (apiFn) => {
    try {
      return await apiFn();
    } catch (err) {
      const res = err?.response;
      if (res?.status === 403 && res?.data?.upgradeRequired) {
        setLimitFeature(res.data.feature || "resumeAnalyses");
        return null;
      }
      throw err; // re-throw non-limit errors so callers can handle them
    }
  }, []);

  const closeModal = useCallback(() => setLimitFeature(null), []);

  const upgradeModal = limitFeature ? (
    <UpgradeModal feature={limitFeature} onClose={closeModal} />
  ) : null;

  return { call, upgradeModal, limitFeature };
}