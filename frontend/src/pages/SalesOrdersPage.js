import React, { useEffect, useState } from 'react';
import { Layout } from '../components/Layout';
import api from '../utils/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { toast } from 'sonner';
import { Plus, ShoppingBag } from 'lucide-react';

export const SalesOrdersPage = () => {
  const [salesOrders, setSalesOrders] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_type: '',
    total_quantity: '',
    total_amount: '',
    imei_list: '',
  });

  useEffect(() => {
    fetchSalesOrders();
  }, []);

  const fetchSalesOrders = async () => {
    try {
      const response = await api.get('/sales-orders');
      setSalesOrders(response.data);
    } catch (error) {
      toast.error('Failed to fetch sales orders');
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const imeiArray = formData.imei_list.split(',').map(i => i.trim()).filter(i => i);
      await api.post('/sales-orders', {
        ...formData,
        total_quantity: parseInt(formData.total_quantity),
        total_amount: parseFloat(formData.total_amount),
        imei_list: imeiArray,
      });
      toast.success('Sales order created successfully');
      setDialogOpen(false);
      setFormData({
        customer_name: '',
        customer_type: '',
        total_quantity: '',
        total_amount: '',
        imei_list: '',
      });
      fetchSalesOrders();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to create sales order');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      Created: 'bg-blue-50 text-blue-700 border-blue-200',
      Fulfilled: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      Cancelled: 'bg-red-50 text-red-700 border-red-200',
    };
    return colors[status] || 'bg-slate-50 text-slate-700 border-slate-200';
  };

  return (
    <Layout>
      <div data-testid="sales-orders-page">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Sales Orders</h1>
            <p className="text-slate-600 mt-1">Manage export sales to agencies</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button data-testid="create-sales-order-button">
                <Plus className="w-4 h-4 mr-2" />
                Create Sales Order
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Sales Order</DialogTitle>
                <DialogDescription>Create new export sales order</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreate} className="space-y-4" data-testid="sales-order-form">
                <div>
                  <Label>Customer Name</Label>
                  <Input
                    value={formData.customer_name}
                    onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                    required
                    data-testid="customer-name-input"
                  />
                </div>
                <div>
                  <Label>Customer Type</Label>
                  <Select value={formData.customer_type} onValueChange={(value) => setFormData({ ...formData, customer_type: value })} required>
                    <SelectTrigger data-testid="customer-type-select">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Export Agency">Export Agency</SelectItem>
                      <SelectItem value="Distributor">Distributor</SelectItem>
                      <SelectItem value="Retailer">Retailer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Total Quantity</Label>
                  <Input
                    type="number"
                    value={formData.total_quantity}
                    onChange={(e) => setFormData({ ...formData, total_quantity: e.target.value })}
                    required
                    data-testid="quantity-input"
                  />
                </div>
                <div>
                  <Label>Total Amount</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.total_amount}
                    onChange={(e) => setFormData({ ...formData, total_amount: e.target.value })}
                    required
                    data-testid="amount-input"
                  />
                </div>
                <div>
                  <Label>IMEI List (comma-separated)</Label>
                  <Input
                    value={formData.imei_list}
                    onChange={(e) => setFormData({ ...formData, imei_list: e.target.value })}
                    placeholder="356789012345678, 356789012345679"
                    required
                    className="font-mono"
                    data-testid="imei-list-input"
                  />
                </div>
                <Button type="submit" className="w-full" data-testid="submit-sales-order">
                  Create Sales Order
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full" data-testid="sales-orders-table">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">SO Number</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Customer</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Quantity</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Created</th>
                </tr>
              </thead>
              <tbody>
                {salesOrders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                      <ShoppingBag className="w-12 h-12 mx-auto mb-2 text-slate-300" />
                      No sales orders found
                    </td>
                  </tr>
                ) : (
                  salesOrders.map((order) => (
                    <tr key={order.sales_order_id} className="table-row border-b border-slate-100" data-testid="sales-order-row">
                      <td className="px-4 py-3 text-sm font-mono font-medium text-slate-900">{order.so_number}</td>
                      <td className="px-4 py-3 text-sm text-slate-900">{order.customer_name}</td>
                      <td className="px-4 py-3 text-sm text-slate-600">{order.customer_type}</td>
                      <td className="px-4 py-3 text-sm text-slate-900">{order.total_quantity}</td>
                      <td className="px-4 py-3 text-sm text-right text-slate-900">₹{order.total_amount.toFixed(2)}</td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`status-badge ${getStatusColor(order.status)}`}>{order.status}</span>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600">{new Date(order.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
};