import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useAppSelector, useAppDispatch } from "../../../store/hooks";
import { useNotifications } from "../../../feature/Notifications/hooks/useNotifications";
import {
  approveRequest,
  rejectRequest,
} from "../../../store/Slice/notificationSlice";
import AdminSidebar from "../../../feature/core/components/AdminSidebar";
import { CheckCircle, XCircle, Clock, User, Mail, Calendar, Hash } from "lucide-react";
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
    if (!isAuthenticated || user?.role !== "admin") {
      navigate("/admin/login");
    }
  }, [isAuthenticated, user, navigate]);

  if (!isAuthenticated || user?.role !== "admin") {
    return null;
  }

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
      await dispatch(
        rejectRequest({ notificationId, reason: "Request rejected by admin" })
      ).unwrap();
      setSelectedRequest(null);
      setActionType(null);
    } catch (error) {
      console.error("Failed to reject request:", error);
    } finally {
      setProcessing(false);
    }
  };

  const openConfirmDialog = (notificationId: string, type: "approve" | "reject") => {
    setSelectedRequest(notificationId);
    setActionType(type);
  };

  return (
    <div className="flex min-h-screen bg-neutral-50">
      <AdminSidebar />
      <div className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Pending Join Requests
            </h1>
            <p className="text-gray-600 mt-2">
              Review and approve space join requests from students and alumni
            </p>
          </div>

          {/* Stats */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="flex items-center gap-4">
              <Clock className="w-8 h-8 text-yellow-500" />
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {pendingRequests.length}
                </p>
                <p className="text-sm text-gray-600">Pending Requests</p>
              </div>
            </div>
          </div>

          {/* Requests List */}
          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Loading requests...</p>
            </div>
          ) : pendingRequests.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                All caught up!
              </h3>
              <p className="text-gray-600">
                No pending join requests at the moment
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingRequests.map((request) => (
                <div
                  key={request._id}
                  className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-6"
                >
                  <div className="flex items-start justify-between">
                    {/* User Info */}
                    <div className="flex items-start gap-4 flex-1">
                      {/* Avatar */}
                      <div className="flex-shrink-0">
                        {request.from.avatar ? (
                          <img
                            src={request.from.avatar}
                            alt={request.from.name}
                            className="w-16 h-16 rounded-full"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-full bg-blue-500 flex items-center justify-center text-white text-2xl font-semibold">
                            {request.from.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>

                      {/* Details */}
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {request.from.name}
                        </h3>

                        <div className="mt-2 space-y-1">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Mail className="w-4 h-4" />
                            <span>{request.from.email}</span>
                          </div>

                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <User className="w-4 h-4" />
                            <span className="capitalize">{request.from.role}</span>
                            {request.from.department && (
                              <span>• {request.from.department}</span>
                            )}
                          </div>

                          {request.from.registrationNumber && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Hash className="w-4 h-4" />
                              <span>Reg. No: {request.from.registrationNumber}</span>
                            </div>
                          )}

                          {request.from.batchYear && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Calendar className="w-4 h-4" />
                              <span>Batch {request.from.batchYear}</span>
                            </div>
                          )}
                        </div>

                        {/* Space Info */}
                        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-600">
                            Requested to join
                          </p>
                          <p className="font-semibold text-gray-900">
                            {request.space.title}
                          </p>
                        </div>

                        {/* Timestamp */}
                        <p className="text-xs text-gray-500 mt-3">
                          Requested{" "}
                          {new Date(request.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 ml-4">
                      <Button
                        onClick={() => openConfirmDialog(request._id, "approve")}
                        className="bg-green-600 hover:bg-green-700 text-white"
                        disabled={processing}
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Approve
                      </Button>

                      <Button
                        onClick={() => openConfirmDialog(request._id, "reject")}
                        variant="outline"
                        className="border-red-600 text-red-600 hover:bg-red-50"
                        disabled={processing}
                      >
                        <XCircle className="w-4 h-4 mr-2" />
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

      {/* Confirmation Dialog */}
      <AlertDialog
        open={selectedRequest !== null}
        onOpenChange={() => {
          setSelectedRequest(null);
          setActionType(null);
        }}
      >
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
                  if (actionType === "approve") {
                    handleApprove(selectedRequest);
                  } else {
                    handleReject(selectedRequest);
                  }
                }
              }}
              disabled={processing}
              className={
                actionType === "approve"
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-red-600 hover:bg-red-700"
              }
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
