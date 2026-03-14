import React, { useEffect, useState } from 'react';
import { Layout } from '../components/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Users, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import api from '../utils/api';

export const UsersPage = () => {
  const [approvals, setApprovals] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchApprovals = async () => {
    try {
      const { data } = await api.get('/auth/admin-approvals');
      setApprovals(data);
    } catch (error) {
      toast.error('Failed to fetch pending admin requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApprovals();
  }, []);

  const handleApproveAction = async (userId, action) => {
    try {
      await api.post(`/auth/admin-approvals/${userId}/approve`, { action });
      toast.success(action === 'approve' ? 'Request Approved' : 'Request Rejected');
      fetchApprovals();
    } catch (error) {
      toast.error(`Failed to ${action} request`);
    }
  };

  return (
    <Layout pageTitle="User Management" pageDescription="Manage system users and admin approvals">
      <div data-testid="users-page" className="space-y-6 flex flex-col items-center">
        {/* Approvals Card */}
        <Card className="shadow-sm w-full bg-neutral-100 border border-neutral-900">
          <CardHeader>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Users className="w-5 h-5" />
              Pending Admin Approvals
            </CardTitle>
            <CardDescription className="text-neutral-900">Review and approve new admin requests</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center p-8"><Loader2 className="w-8 h-8 animate-spin text-neutral-400" /></div>
            ) : approvals.length === 0 ? (
              <div className="text-center py-8 text-neutral-500">No pending admin requests.</div>
            ) : (
              <div className="space-y-4">
                {approvals.map((req) => (
                  <div key={req.user_id} className="p-4 border border-neutral-200 rounded-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <h4 className="font-semibold text-neutral-900">{req.name}</h4>
                      <p className="text-sm text-neutral-600">{req.email} • {req.organization}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleApproveAction(req.user_id, 'approve')}
                        className="bg-green-600 hover:bg-green-700 text-white"
                        size="sm"
                      >
                        <CheckCircle className="w-4 h-4 mr-1" /> Approve
                      </Button>
                      <Button
                        onClick={() => handleApproveAction(req.user_id, 'reject')}
                        variant="destructive"
                        size="sm"
                      >
                        <XCircle className="w-4 h-4 mr-1" /> Reject
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Existing message for general user management */}
        <Card className="shadow-sm w-full bg-neutral-100 border border-neutral-900 flex items-center justify-center">
          <CardContent className="pt-6">
            <div className="text-center py-6">
              <h3 className="text-lg font-medium text-neutral-900 mb-2">User Management Coming Soon</h3>
              <p className="text-neutral-600 max-w-md mx-auto">
                Advanced user management features including editing existing users and monitoring
                will be available in the next update.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};