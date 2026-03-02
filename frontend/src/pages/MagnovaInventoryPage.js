import React, { useEffect, useMemo, useState } from 'react';
import { Layout } from '../components/Layout';
import api from '../utils/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { toast } from 'sonner';
import { Scan, Trash2, Bell, ChevronDown, ChevronUp } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useDataRefresh } from '../context/DataRefreshContext';
import { Navigate } from 'react-router-dom';

const MAGNOVA_OUTWARD_LOCATIONS = ['Vijayawada', 'Hyderabad', 'Chennai', 'Bengaluru'];

const normalizeLocation = (location) => {
  const raw = (location || 'Unknown').toString().trim();
  if (!raw) {
    return { key: 'unknown', label: 'Unknown' };
  }

  const normalizedKey = raw.toLowerCase().replace(/[^a-z]/g, '');
  const aliasMap = new Map([
    ['hyderabad', 'Hyderabad'],
    ['hyderbad', 'Hyderabad'],
    ['hyderabd', 'Hyderabad'],
    ['hydrabad', 'Hyderabad'],
    ['hydrebad', 'Hyderabad'],
    ['bangalore', 'Bengaluru'],
    ['bengaluru', 'Bengaluru'],
    ['vijayawada', 'Vijayawada'],
    ['vijaywada', 'Vijayawada'],
    ['chennai', 'Chennai'],
  ]);

  const canonical = aliasMap.get(normalizedKey);
  if (canonical) {
    return { key: canonical.toLowerCase(), label: canonical };
  }

  return { key: raw.toLowerCase(), label: raw };
};

export const MagnovaInventoryPage = () => {
  const [inventory, setInventory] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [locations, setLocations] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [imeiLookup, setImeiLookup] = useState(null);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    magnovaOutward: true,
  });
  const { user } = useAuth();
  const { 
    refreshTimestamps, 
    refreshAfterInventoryChange,
    pendingInventory,
    clearInventoryNotification,
    addInvoiceNotification,
  } = useDataRefresh();
  const isAdmin = user?.role === 'Admin';
  const hasAccess = user?.role === 'Admin' || user?.role === 'Inventory';
  const [scanData, setScanData] = useState({
    imei: '',
    action: '',
    location: '',
    vendor: '',
    brand: '',
    model: '',
    colour: '',
  });

  useEffect(() => {
    fetchInventory();
    fetchPOData();
  }, [refreshTimestamps.inventory, refreshTimestamps.purchaseOrders]);

  const fetchInventory = async () => {
    try {
      const response = await api.get('/inventory');
      setInventory(response.data);
    } catch (error) {
      toast.error('Failed to fetch inventory');
    }
  };

  const fetchPOData = async () => {
    try {
      const response = await api.get('/purchase-orders');
      const allLocations = new Set();
      const allVendors = new Set();
      response.data.forEach(po => {
        if (po.items) {
          po.items.forEach(item => {
            if (item.location) allLocations.add(item.location);
            if (item.vendor) allVendors.add(item.vendor);
          });
        }
      });
      setLocations(Array.from(allLocations));
      setVendors(Array.from(allVendors));
    } catch (error) {
      console.error('Error fetching PO data:', error);
    }
  };

  const handleImeiChange = async (imei) => {
    setScanData(prev => ({ ...prev, imei }));
    setImeiLookup(null);
    
    if (imei.length >= 10) {
      setLookupLoading(true);
      try {
        const response = await api.get(`/inventory/lookup/${imei}`);
        setImeiLookup(response.data);
        
        if (response.data.found) {
          setScanData(prev => ({
            ...prev,
            vendor: response.data.vendor || prev.vendor,
            location: response.data.store_location || response.data.current_location || prev.location,
            brand: response.data.brand || prev.brand,
            model: response.data.model || prev.model,
            colour: response.data.colour || prev.colour,
          }));
          
          if (response.data.in_inventory) {
            toast.success(`IMEI found in inventory - Status: ${response.data.status}`);
          } else if (response.data.in_procurement) {
            toast.success(`IMEI found in procurement - Vendor: ${response.data.vendor}`);
          } else {
            toast.success('IMEI accepted - Ready to enter inventory details');
          }
        }
      } catch (error) {
        console.error('Lookup error:', error);
        setImeiLookup({ found: true });
        toast.success('IMEI accepted - Ready to enter inventory details');
      } finally {
        setLookupLoading(false);
      }
    }
  };

  const handleScan = async (e) => {
    e.preventDefault();
    
    if (!scanData.imei || !scanData.imei.trim()) {
      toast.error('IMEI is required');
      return;
    }
    if (!scanData.action || !scanData.action.trim()) {
      toast.error('Action is required');
      return;
    }
    if (!scanData.location || !scanData.location.trim()) {
      toast.error('Location is required');
      return;
    }
    if (!scanData.vendor || !scanData.vendor.trim()) {
      toast.error('Vendor is required');
      return;
    }
    
    try {
      await api.post('/inventory/scan', {
        imei: scanData.imei,
        action: scanData.action,
        location: scanData.location,
        organization: 'Magnova',
        vendor: scanData.vendor,
        brand: scanData.brand,
        model: scanData.model,
        colour: scanData.colour,
      });
      
      pendingInventory.forEach(notif => {
        if (notif.po_number) {
          clearInventoryNotification(notif.po_number, notif.shipment_id);
        }
      });
      
      addInvoiceNotification({
        po_number: imeiLookup?.po_number || '',
        imei: scanData.imei,
        brand: scanData.brand,
        model: scanData.model,
        vendor: scanData.vendor,
        location: scanData.location,
        action: scanData.action,
      });
      
      toast.success('IMEI scanned - Invoice notification sent');
      setDialogOpen(false);
      setScanData({ imei: '', action: '', location: '', vendor: '', brand: '', model: '', colour: '' });
      setImeiLookup(null);
      refreshAfterInventoryChange();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to scan IMEI');
    }
  };

  const handleDelete = async (imei) => {
    if (!window.confirm(`Are you sure you want to delete IMEI ${imei}?`)) return;
    try {
      await api.delete(`/inventory/${imei}`);
      toast.success('Inventory item deleted successfully');
      refreshAfterInventoryChange();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to delete item');
    }
  };

  const resetForm = () => {
    setScanData({ imei: '', action: '', location: '', vendor: '', brand: '', model: '', colour: '' });
    setImeiLookup(null);
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const outwardLocationMap = useMemo(() => {
    const map = new Map();
    MAGNOVA_OUTWARD_LOCATIONS.forEach((location) => {
      const { key, label } = normalizeLocation(location);
      map.set(key, `Magnova - ${label}`);
    });
    return map;
  }, []);

  // Filter only Magnova Outward inventory
  const magnovaOutwardInventory = useMemo(() => {
    return inventory.filter(item => {
      const status = item.status || '';
      return status.includes('Outward Magnova');
    });
  }, [inventory]);

  // Group items by location within each section
  const groupByLocation = (items) => {
    const locationMap = new Map();
    items.forEach(item => {
      const { key, label } = normalizeLocation(item.current_location || 'Unknown');
      if (!locationMap.has(key)) {
        locationMap.set(key, { label, items: [] });
      }
      locationMap.get(key).items.push(item);
    });
    return locationMap;
  };

  const renderInventoryTable = (items, options = {}) => {
    if (items.length === 0) {
      if (!options.includeEmptyLocations) {
        return (
          <div className="px-4 py-6 text-center text-neutral-500 text-sm">
            No inventory items found
          </div>
        );
      }
    }

    const locationMap = groupByLocation(items);
    const orderedLocationKeys = options.orderedLocationKeys
      ? options.orderedLocationKeys
      : Array.from(locationMap.entries())
          .sort((a, b) => a[1].label.localeCompare(b[1].label))
          .map(([key]) => key);

    if (options.includeEmptyLocations) {
      orderedLocationKeys.forEach((key) => {
        if (!locationMap.has(key)) {
          const label = options.locationLabelMap?.get(key) || key;
          locationMap.set(key, { label, items: [] });
        }
      });
    }

    return (
      <div className="space-y-4">
        {orderedLocationKeys.map(locationKey => {
          const locationGroup = locationMap.get(locationKey);
          const locationItems = locationGroup?.items || [];
          const locationLabel = locationGroup?.label || locationKey;
          return (
            <div key={locationKey} className="border border-neutral-200 rounded-lg overflow-hidden">
              <div className="bg-gray-100 px-4 py-2 font-semibold text-neutral-800 text-sm">
                Ware House: {locationLabel}
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr style={{ backgroundColor: '#BFC9D1' }} className="text-neutral-900">
                      <th className="px-4 py-2 text-left font-medium text-xs uppercase">Brand</th>
                      <th className="px-4 py-2 text-left font-medium text-xs uppercase">Model</th>
                      <th className="px-4 py-2 text-left font-medium text-xs uppercase">Storage</th>
                      <th className="px-4 py-2 text-left font-medium text-xs uppercase">Colour</th>
                      <th className="px-4 py-2 text-center font-medium text-xs uppercase">QTY</th>
                      <th className="px-4 py-2 text-left font-medium text-xs uppercase">IMEI</th>
                      {isAdmin && <th className="px-4 py-2 text-center font-medium text-xs uppercase">Actions</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {locationItems.map((item, idx) => (
                      <tr key={item.imei} className={idx % 2 === 0 ? 'bg-white' : 'bg-neutral-50'}>
                        <td className="px-4 py-2 text-neutral-900">{item.brand || '-'}</td>
                        <td className="px-4 py-2 text-neutral-900">{item.model || item.device_model || '-'}</td>
                        <td className="px-4 py-2 text-neutral-900">{item.storage || '-'}</td>
                        <td className="px-4 py-2 text-neutral-900">{item.colour || '-'}</td>
                        <td className="px-4 py-2 text-center text-neutral-900">1</td>
                        <td className="px-4 py-2 font-mono text-neutral-900">{item.imei}</td>
                        {isAdmin && (
                          <td className="px-4 py-2 text-center">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDelete(item.imei)}
                              className="text-neutral-800 hover:text-neutral-900 hover:bg-neutral-100 h-6 w-6 p-0"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="bg-neutral-50 px-4 py-2 border-t border-neutral-200 text-xs font-semibold text-neutral-800">
                Total: {locationItems.length} items
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  if (!hasAccess) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <Layout pageTitle="Magnova Inventory" pageDescription="Track Magnova device inventory with IMEI-level visibility">
      <div data-testid="magnova-inventory-page" className="space-y-6">
        {/* Inventory Notifications Banner */}
        {pendingInventory.length > 0 && (
          <div className="mb-6 bg-neutral-50 border border-neutral-300 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <Bell className="w-5 h-5 text-neutral-600 animate-pulse" />
              <h3 className="font-semibold text-neutral-800">Shipment Complete - Ready for Inventory Scan</h3>
              <span className="bg-neutral-800 text-white text-xs px-2 py-0.5 rounded-full">{pendingInventory.length}</span>
            </div>
          </div>
        )}

        {/* Add Inventory Item Dialog */}
        <div className="flex justify-end mb-6">
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gray-900 hover:bg-gray-800 text-white">
                <Scan className="w-4 h-4 mr-2" />
                Scan/Add Inventory
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add Magnova Inventory Item</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleScan} className="space-y-4">
                <div>
                  <Label className="text-neutral-700">IMEI *</Label>
                  <Input
                    type="text"
                    value={scanData.imei}
                    onChange={(e) => handleImeiChange(e.target.value)}
                    className="bg-white text-neutral-900 border-neutral-400 h-9"
                    placeholder="Enter or scan IMEI"
                    autoFocus
                    data-testid="scan-imei-input"
                  />
                  {lookupLoading && <span className="text-xs text-neutral-500 mt-1">Looking up IMEI...</span>}
                </div>

                {imeiLookup?.found && (
                  <div className="grid grid-cols-3 gap-3 p-3 bg-neutral-50 rounded-lg border border-neutral-200">
                    <div>
                      <Label className="text-neutral-500 text-xs">Brand</Label>
                      <Input
                        value={scanData.brand || '-'}
                        readOnly
                        className="font-medium bg-white text-neutral-900 h-9"
                      />
                    </div>
                    <div>
                      <Label className="text-neutral-500 text-xs">Model</Label>
                      <Input
                        value={scanData.model || '-'}
                        readOnly
                        className="font-medium bg-white text-neutral-900 h-9"
                      />
                    </div>
                    <div>
                      <Label className="text-neutral-500 text-xs">Colour</Label>
                      <Input
                        value={scanData.colour || '-'}
                        readOnly
                        className="font-medium bg-white text-neutral-900 h-9"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <Label className="text-neutral-700">Action *</Label>
                  <Select value={scanData.action} onValueChange={(value) => setScanData({ ...scanData, action: value })} required>
                    <SelectTrigger data-testid="scan-action-select" className="bg-white text-neutral-900 border-neutral-400 h-9">
                      <SelectValue placeholder="Select action" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-neutral-300 z-[100]">
                      <SelectItem value="outward_magnova" className="text-neutral-900">Outward Magnova</SelectItem>
                      <SelectItem value="dispatch" className="text-neutral-900">Dispatch</SelectItem>
                      <SelectItem value="available" className="text-neutral-900">Mark Available</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label className="text-neutral-700">Brand</Label>
                    <Input
                      value={scanData.brand}
                      onChange={(e) => setScanData({ ...scanData, brand: e.target.value })}
                      className="bg-white text-neutral-900 border-neutral-400 h-9"
                      placeholder="Enter brand"
                    />
                  </div>
                  <div>
                    <Label className="text-neutral-700">Model</Label>
                    <Input
                      value={scanData.model}
                      onChange={(e) => setScanData({ ...scanData, model: e.target.value })}
                      className="bg-white text-neutral-900 border-neutral-400 h-9"
                      placeholder="Enter model"
                    />
                  </div>
                  <div>
                    <Label className="text-neutral-700">Colour</Label>
                    <Input
                      value={scanData.colour}
                      onChange={(e) => setScanData({ ...scanData, colour: e.target.value })}
                      className="bg-white text-neutral-900 border-neutral-400 h-9"
                      placeholder="Enter colour"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-neutral-700">Vendor {imeiLookup?.found ? '(Auto-populated)' : '*'}</Label>
                    <Select 
                      value={scanData.vendor} 
                      onValueChange={(value) => setScanData({ ...scanData, vendor: value })} 
                      required={!imeiLookup?.found}
                    >
                      <SelectTrigger className={`text-neutral-900 border-neutral-400 h-9 ${imeiLookup?.found && scanData.vendor ? 'bg-neutral-100' : 'bg-white'}`}>
                        <SelectValue placeholder="Select vendor" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-neutral-300 z-[100]">
                        {vendors.length > 0 ? (
                          vendors.map((vendor) => (
                            <SelectItem key={vendor} value={vendor} className="text-neutral-900">{vendor}</SelectItem>
                          ))
                        ) : (
                          <>
                            <SelectItem value="Croma" className="text-neutral-900">Croma</SelectItem>
                            <SelectItem value="Reliance Digital" className="text-neutral-900">Reliance Digital</SelectItem>
                            <SelectItem value="Vijay Sales" className="text-neutral-900">Vijay Sales</SelectItem>
                            <SelectItem value="Amazon" className="text-neutral-900">Amazon</SelectItem>
                            <SelectItem value="Flipkart" className="text-neutral-900">Flipkart</SelectItem>
                          </>
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-neutral-700">Location {imeiLookup?.found ? '(Auto-populated)' : '*'}</Label>
                    <Select 
                      value={scanData.location} 
                      onValueChange={(value) => setScanData({ ...scanData, location: value })} 
                      required={!imeiLookup?.found}
                    >
                      <SelectTrigger className={`text-neutral-900 border-neutral-400 h-9 ${imeiLookup?.found && scanData.location ? 'bg-neutral-100' : 'bg-white'}`} data-testid="scan-location-select">
                        <SelectValue placeholder="Select location" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-neutral-300 z-[100]">
                        {locations.length > 0 ? (
                          locations.map((loc) => (
                            <SelectItem key={loc} value={loc} className="text-neutral-900">{loc}</SelectItem>
                          ))
                        ) : (
                          <>
                            <SelectItem value="Mumbai" className="text-neutral-900">Mumbai</SelectItem>
                            <SelectItem value="Delhi" className="text-neutral-900">Delhi</SelectItem>
                            <SelectItem value="Bangalore" className="text-neutral-900">Bangalore</SelectItem>
                            <SelectItem value="Chennai" className="text-neutral-900">Chennai</SelectItem>
                            <SelectItem value="Hyderabad" className="text-neutral-900">Hyderabad</SelectItem>
                            <SelectItem value="Pune" className="text-neutral-900">Pune</SelectItem>
                          </>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-gray-900 hover:bg-gray-800 text-white" 
                  data-testid="submit-scan"
                  disabled={
                    !scanData.imei ||
                    !scanData.action ||
                    !scanData.location ||
                    !scanData.vendor ||
                    (!imeiLookup?.found && scanData.imei.length >= 10)
                  }
                >
                  {imeiLookup?.found ? 'Scan & Update' : 'Add to Inventory & Update'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Inventory - Magnova Section */}
        <div className="space-y-4">
          <div className="text-2xl font-bold text-neutral-900">Inventory - Magnova</div>
          
          {/* Magnova - Outward */}
          <div className="border border-neutral-200 rounded-lg overflow-hidden">
            <button
              onClick={() => toggleSection('magnovaOutward')}
              className="w-full bg-gray-200 px-4 py-3 flex items-center justify-between hover:bg-gray-250 transition-colors"
            >
              <h3 className="font-semibold text-neutral-800 text-lg">Outward</h3>
              {expandedSections.magnovaOutward ? <ChevronUp /> : <ChevronDown />}
            </button>
            {expandedSections.magnovaOutward && (
              <div className="p-4">
                {renderInventoryTable(
                  magnovaOutwardInventory.filter(item => {
                    const { key } = normalizeLocation(item.current_location || 'Unknown');
                    return outwardLocationMap.has(key);
                  }),
                  {
                    orderedLocationKeys: Array.from(outwardLocationMap.keys()),
                    locationLabelMap: outwardLocationMap,
                    includeEmptyLocations: true,
                  }
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};
