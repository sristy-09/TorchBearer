import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useAppSelector, useAppDispatch } from "../../../store/hooks";
import { useNotifications } from "../../../feature/Notifications/hooks/useNotifications";
import { approveRequest, rejectRequest } from "../../../store/Slice/notificationSlice";
import AdminSidebar from "../../../feature/core/components/AdminSidebar";
import { CheckCircle, XCircle, Clock, User, Mail, Calendar } from "lucide-react";
import { Button } from "../../../feature/core/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../../feature/core/components/ui/alert-dialog";

function AdminPendingRequests() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const { pendingRequests, loading } = useNotifications();

  const [selectedRequest, setSelectedRequest] = useState<string | null>(null);
  const [actionType, setActionType] = useState<"approve" | "reject" | null>(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== "admin") navigate("/admin/login");
  }, [isAuthenticated, user, navigate]);

  if (!isAuthenticated || user?.role !== "admin") return null;

  const handleApprove = async (notificationId: string) => {
    setProcessing(true);
    try {
      await dispatch(approveRequest(notificationId)).unwrap();
      setSelectedRequest(null);
      setActionType(null);
    } catch (error) {
      console.error("Failed to approve request:", error);
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async (notificationId: string) => {
    setProcessing(true);
    try {
      await dispatch(rejectRequest({ notificationId, reason: "Request rejected by admin" })).unwrap();
      setSelectedRequest(null);
      setActionType(null);
    } catch (error) {
      console.error("Failed to reject request:", error);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="flex min-h-screen" style={{ background: "var(--background)" }}>
      <AdminSidebar />
      <div className="flex-1 p-8">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-foreground tracking-tight">Pending Join Requests</h1>
            <p className="text-muted-foreground mt-1 text-sm">
              Review and approve space join requests from students and alumni
            </p>
          </div>

          {/* Stats */}
          <div className="rounded-2xl p-5 border mb-6 flex items-center gap-4"
            style={{ background: "var(--card)", borderColor: "var(--border)" }}>
            <div className="w-11 h-11 rounded-xl flex items-center justify-center"
              style={{ background: "rgba(245,158,11,0.12)" }}>
              <Clock className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{pendingRequests.length}</p>
              <p className="text-xs text-muted-foreground">Pending Requests</p>
            </div>
          </div>

          {/* Requests */}
          {loading ? (
            <div className="text-center py-12 text-muted-foreground text-sm">Loading requests...</div>
          ) : pendingRequests.length === 0 ? (
            <div className="rounded-2xl p-12 text-center border"
              style={{ background: "var(--card)", borderColor: "var(--border)" }}>
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
                style={{ background: "rgba(16,185,129,0.1)" }}>
                <CheckCircle className="w-7 h-7 text-emerald-500" />
              </div>
              <h3 className="text-base font-semibold text-foreground mb-1">All caught up!</h3>
              <p className="text-sm text-muted-foreground">No pending join requests at the moment</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingRequests.map((request) => (
                <div key={request._id} className="rounded-2xl border p-6 transition-all"
                  style={{ background: "var(--card)", borderColor: "var(--border)" }}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      {/* Avatar */}
                      <div className="shrink-0">
                        {request.from.avatar ? (
                          <img src={request.from.avatar} alt={request.from.name}
                            className="w-14 h-14 rounded-2xl object-cover" />
                        ) : (
                          <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-xl font-bold"
                            style={{ background: "linear-gradient(135deg, var(--primary) 0%, #A855F7 100%)" }}>
                            {request.from.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>

                      {/* Details */}
                      <div className="flex-1">
                        <h3 className="text-base font-semibold text-foreground">{request.from.name}</h3>
                        <div className="mt-2 space-y-1">
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Mail className="w-3.5 h-3.5" />
                            <span>{request.from.email}</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <User className="w-3.5 h-3.5" />
                            <span className="capitalize">{request.from.role}</span>
                            {request.from.department && <span>· {request.from.department}</span>}
                          </div>
                          {request.from.batchYear && (
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Calendar className="w-3.5 h-3.5" />
                              <span>Batch {request.from.batchYear}</span>
                            </div>
                          )}
                        </div>

                        {/* Space info */}
                        <div className="mt-3 px-3 py-2 rounded-xl inline-block"
                          style={{ background: "var(--secondary)" }}>
                          <p className="text-xs text-muted-foreground">Requested to join</p>
                          <p className="text-sm font-semibold" style={{ color: "var(--primary)" }}>
                            {request.space.title}
                          </p>
                        </div>

                        <p className="text-xs text-muted-foreground mt-3">
                          Requested {new Date(request.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 ml-4">
                      <Button
                        onClick={() => { setSelectedRequest(request._id); setActionType("approve"); }}
                        className="rounded-xl text-white font-medium text-sm"
                        style={{ background: "rgba(16,185,129,0.9)" }}
                        disabled={processing}
                      >
                        <CheckCircle className="w-4 h-4 mr-1.5" />
                        Approve
                      </Button>
                      <Button
                        onClick={() => { setSelectedRequest(request._id); setActionType("reject"); }}
                        variant="outline"
                        className="rounded-xl font-medium text-sm text-red-500 border-red-200 hover:bg-red-50"
                        disabled={processing}
                      >
                        <XCircle className="w-4 h-4 mr-1.5" />
                        Reject
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <AlertDialog open={selectedRequest !== null} onOpenChange={() => { setSelectedRequest(null); setActionType(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {actionType === "approve" ? "Approve Request?" : "Reject Request?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {actionType === "approve"
                ? "This user will be added to the space and notified immediately."
                : "This user will be notified that their request was rejected."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={processing}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (selectedRequest) {
                  if (actionType === "approve") handleApprove(selectedRequest);
                  else handleReject(selectedRequest);
                }
              }}
              disabled={processing}
              className={actionType === "approve" ? "bg-emerald-600 hover:bg-emerald-700" : "bg-red-600 hover:bg-red-700"}
            >
              {processing ? "Processing..." : "Confirm"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default AdminPendingRequests;
