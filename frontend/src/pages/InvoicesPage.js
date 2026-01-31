import React, { useEffect, useState } from 'react';
import { Layout } from '../components/Layout';
import api from '../utils/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { toast } from 'sonner';
import { Plus, FileText } from 'lucide-react';

export const InvoicesPage = () => {
  const [invoices, setInvoices] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    invoice_type: '',
    po_number: '',
    from_organization: '',
    to_organization: '',
    amount: '',
    gst_amount: '',
    imei_list: '',
    invoice_date: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      const response = await api.get('/invoices');
      setInvoices(response.data);
    } catch (error) {
      toast.error('Failed to fetch invoices');
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const imeiArray = formData.imei_list.split(',').map(i => i.trim()).filter(i => i);
      await api.post('/invoices', {
        ...formData,
        amount: parseFloat(formData.amount),
        gst_amount: parseFloat(formData.gst_amount),
        imei_list: imeiArray,
        invoice_date: new Date(formData.invoice_date).toISOString(),
      });
      toast.success('Invoice created successfully');
      setDialogOpen(false);
      setFormData({
        invoice_type: '',
        po_number: '',
        from_organization: '',
        to_organization: '',
        amount: '',
        gst_amount: '',
        imei_list: '',
        invoice_date: new Date().toISOString().split('T')[0],
      });
      fetchInvoices();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to create invoice');
    }
  };

  return (
    <Layout>
      <div data-testid="invoices-page">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Invoices</h1>
            <p className="text-slate-600 mt-1">Manage invoicing across organizations</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button data-testid="create-invoice-button">
                <Plus className="w-4 h-4 mr-2" />
                Create Invoice
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create Invoice</DialogTitle>
                <DialogDescription>Generate new invoice</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreate} className="space-y-4" data-testid="invoice-form">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Invoice Type</Label>
                    <Select value={formData.invoice_type} onValueChange={(value) => setFormData({ ...formData, invoice_type: value })} required>
                      <SelectTrigger data-testid="invoice-type-select">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Vendor">Vendor Invoice</SelectItem>
                        <SelectItem value="Nova to Magnova">Nova to Magnova</SelectItem>
                        <SelectItem value="Magnova to Export">Magnova to Export Agency</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>PO Number</Label>
                    <Input
                      value={formData.po_number}
                      onChange={(e) => setFormData({ ...formData, po_number: e.target.value })}
                      required
                      className="font-mono"
                      data-testid="po-input"
                    />
                  </div>
                  <div>
                    <Label>From Organization</Label>
                    <Input
                      value={formData.from_organization}
                      onChange={(e) => setFormData({ ...formData, from_organization: e.target.value })}
                      required
                      data-testid="from-org-input"
                    />
                  </div>
                  <div>
                    <Label>To Organization</Label>
                    <Input
                      value={formData.to_organization}
                      onChange={(e) => setFormData({ ...formData, to_organization: e.target.value })}
                      required
                      data-testid="to-org-input"
                    />
                  </div>
                  <div>
                    <Label>Amount</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      required
                      data-testid="amount-input"
                    />
                  </div>
                  <div>
                    <Label>GST Amount</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.gst_amount}
                      onChange={(e) => setFormData({ ...formData, gst_amount: e.target.value })}
                      required
                      data-testid="gst-input"
                    />
                  </div>
                  <div>
                    <Label>Invoice Date</Label>
                    <Input
                      type="date"
                      value={formData.invoice_date}
                      onChange={(e) => setFormData({ ...formData, invoice_date: e.target.value })}
                      required
                      data-testid="date-input"
                    />
                  </div>
                  <div className="col-span-2">
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
                </div>
                <Button type="submit" className="w-full" data-testid="submit-invoice">
                  Create Invoice
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full" data-testid="invoices-table">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Invoice No.</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">PO Number</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">From → To</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Amount</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">GST</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Total</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody>
                {invoices.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-slate-500">
                      <FileText className="w-12 h-12 mx-auto mb-2 text-slate-300" />
                      No invoices found
                    </td>
                  </tr>
                ) : (
                  invoices.map((invoice) => (
                    <tr key={invoice.invoice_id} className="table-row border-b border-slate-100" data-testid="invoice-row">
                      <td className="px-4 py-3 text-sm font-mono font-medium text-slate-900">{invoice.invoice_number}</td>
                      <td className="px-4 py-3 text-sm text-slate-600">{invoice.invoice_type}</td>
                      <td className="px-4 py-3 text-sm font-mono text-slate-900">{invoice.po_number}</td>
                      <td className="px-4 py-3 text-sm text-slate-600">{invoice.from_organization} → {invoice.to_organization}</td>
                      <td className="px-4 py-3 text-sm text-right text-slate-900">₹{invoice.amount.toFixed(2)}</td>
                      <td className="px-4 py-3 text-sm text-right text-slate-600">₹{invoice.gst_amount.toFixed(2)}</td>
                      <td className="px-4 py-3 text-sm text-right font-medium text-slate-900">₹{invoice.total_amount.toFixed(2)}</td>
                      <td className="px-4 py-3 text-sm text-slate-600">{new Date(invoice.invoice_date).toLocaleDateString()}</td>
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