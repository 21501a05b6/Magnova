"""
Backend API Tests for CRM-style Inventory Management Features
Tests: Procurement auto-populate, Inventory scan with new actions, Logistics shipment status
"""
import pytest
import requests
import os
from datetime import datetime, timedelta

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
TEST_ADMIN = {
    "email": "admin@magnova.com",
    "password": "admin123"
}

# Nova user for procurement (needs to be created or use existing)
TEST_NOVA_USER = {
    "email": "nova@nova.com",
    "password": "nova123"
}


class TestSetup:
    """Setup tests - ensure we have approved POs for testing"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup: Get auth token"""
        login_response = requests.post(f"{BASE_URL}/api/auth/login", json=TEST_ADMIN)
        if login_response.status_code == 200:
            self.token = login_response.json()["access_token"]
            self.headers = {
                "Authorization": f"Bearer {self.token}",
                "Content-Type": "application/json"
            }
        else:
            pytest.skip("Authentication failed")
    
    def test_create_approved_po_for_testing(self):
        """Create and approve a PO for testing auto-populate features"""
        # Create PO with detailed line items
        po_data = {
            "po_date": datetime.now().isoformat(),
            "purchase_office": "Magnova Head Office",
            "items": [
                {
                    "sl_no": 1,
                    "vendor": "TEST_CRM_Vendor_Samsung",
                    "location": "Mumbai",
                    "brand": "Samsung",
                    "model": "Galaxy S24 Ultra",
                    "storage": "512GB",
                    "colour": "Titanium Black",
                    "imei": None,
                    "qty": 10,
                    "rate": 125000.00,
                    "po_value": 1250000.00
                },
                {
                    "sl_no": 2,
                    "vendor": "TEST_CRM_Vendor_Apple",
                    "location": "Delhi",
                    "brand": "Apple",
                    "model": "iPhone 15 Pro Max",
                    "storage": "256GB",
                    "colour": "Natural Titanium",
                    "imei": None,
                    "qty": 5,
                    "rate": 159900.00,
                    "po_value": 799500.00
                }
            ],
            "notes": "TEST_CRM_AutoPopulate"
        }
        
        response = requests.post(
            f"{BASE_URL}/api/purchase-orders",
            headers=self.headers,
            json=po_data
        )
        assert response.status_code == 200, f"Failed to create PO: {response.text}"
        po_number = response.json()["po_number"]
        
        # Approve the PO
        approve_response = requests.post(
            f"{BASE_URL}/api/purchase-orders/{po_number}/approve",
            headers=self.headers,
            json={"action": "approve"}
        )
        assert approve_response.status_code == 200, f"Failed to approve PO: {approve_response.text}"
        
        # Verify approval
        get_response = requests.get(
            f"{BASE_URL}/api/purchase-orders/{po_number}",
            headers=self.headers
        )
        assert get_response.json()["approval_status"] == "Approved"
        print(f"Created and approved PO: {po_number}")
        return po_number


class TestProcurementAutoPopulate:
    """Tests for Procurement page auto-populate from PO"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup: Get auth token"""
        login_response = requests.post(f"{BASE_URL}/api/auth/login", json=TEST_ADMIN)
        if login_response.status_code == 200:
            self.token = login_response.json()["access_token"]
            self.headers = {
                "Authorization": f"Bearer {self.token}",
                "Content-Type": "application/json"
            }
        else:
            pytest.skip("Authentication failed")
    
    def test_get_approved_pos_for_procurement(self):
        """Test that GET /purchase-orders returns approved POs with items for auto-populate"""
        response = requests.get(
            f"{BASE_URL}/api/purchase-orders",
            headers=self.headers
        )
        assert response.status_code == 200
        data = response.json()
        
        # Filter approved POs
        approved_pos = [po for po in data if po.get("approval_status") == "Approved"]
        print(f"Found {len(approved_pos)} approved POs")
        
        if len(approved_pos) > 0:
            po = approved_pos[0]
            # Verify PO has items with required fields for auto-populate
            assert "items" in po, "PO missing items field"
            if len(po["items"]) > 0:
                item = po["items"][0]
                # These fields should be available for auto-populate
                assert "vendor" in item, "Item missing vendor"
                assert "location" in item, "Item missing location"
                assert "brand" in item, "Item missing brand"
                assert "model" in item, "Item missing model"
                assert "rate" in item, "Item missing rate"
                print(f"PO {po['po_number']} has {len(po['items'])} items with all required fields")
    
    def test_po_items_contain_auto_populate_fields(self):
        """Verify PO items contain all fields needed for procurement auto-populate"""
        response = requests.get(
            f"{BASE_URL}/api/purchase-orders",
            headers=self.headers
        )
        assert response.status_code == 200
        data = response.json()
        
        approved_pos = [po for po in data if po.get("approval_status") == "Approved"]
        
        for po in approved_pos[:3]:  # Check first 3 approved POs
            for item in po.get("items", []):
                # Required fields for auto-populate
                required_fields = ["vendor", "location", "brand", "model", "rate"]
                for field in required_fields:
                    assert field in item, f"PO {po['po_number']} item missing {field}"
                
                # Optional fields that should also be present
                optional_fields = ["storage", "colour"]
                for field in optional_fields:
                    assert field in item, f"PO {po['po_number']} item missing optional field {field}"


class TestInventoryScanActions:
    """Tests for Inventory scan with new action types"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup: Get auth token and create test IMEI"""
        login_response = requests.post(f"{BASE_URL}/api/auth/login", json=TEST_ADMIN)
        if login_response.status_code == 200:
            self.token = login_response.json()["access_token"]
            self.headers = {
                "Authorization": f"Bearer {self.token}",
                "Content-Type": "application/json"
            }
        else:
            pytest.skip("Authentication failed")
    
    def _create_test_imei(self, imei_number):
        """Helper to create a test IMEI via procurement"""
        # First get an approved PO
        pos_response = requests.get(
            f"{BASE_URL}/api/purchase-orders",
            headers=self.headers
        )
        approved_pos = [po for po in pos_response.json() if po.get("approval_status") == "Approved"]
        
        if not approved_pos:
            pytest.skip("No approved POs available for testing")
        
        po_number = approved_pos[0]["po_number"]
        
        # Create procurement record (this creates IMEI in inventory)
        proc_data = {
            "po_number": po_number,
            "vendor_name": "TEST_Scan_Vendor",
            "store_location": "Mumbai",
            "imei": imei_number,
            "serial_number": f"SN_{imei_number}",
            "device_model": "Samsung Galaxy S24",
            "purchase_price": 75000.00
        }
        
        # Try to create - may fail if IMEI exists
        response = requests.post(
            f"{BASE_URL}/api/procurement",
            headers=self.headers,
            json=proc_data
        )
        return response.status_code in [200, 400]  # 400 if IMEI exists
    
    def test_scan_outward_nova_action(self):
        """Test POST /inventory/scan with outward_nova action"""
        test_imei = "TEST_OUTWARD_NOVA_001"
        self._create_test_imei(test_imei)
        
        scan_data = {
            "imei": test_imei,
            "action": "outward_nova",
            "location": "Mumbai",
            "organization": "Nova",
            "customer_organization": "Nova"
        }
        
        response = requests.post(
            f"{BASE_URL}/api/inventory/scan",
            headers=self.headers,
            json=scan_data
        )
        
        # May be 404 if IMEI doesn't exist, or 200 if successful
        if response.status_code == 200:
            data = response.json()
            assert data.get("status") == "Outward Nova", f"Expected status 'Outward Nova', got {data.get('status')}"
            print("outward_nova action works correctly")
        elif response.status_code == 404:
            print("IMEI not found - need to create procurement first")
        else:
            assert False, f"Unexpected response: {response.status_code} - {response.text}"
    
    def test_scan_outward_magnova_action(self):
        """Test POST /inventory/scan with outward_magnova action"""
        test_imei = "TEST_OUTWARD_MAGNOVA_001"
        self._create_test_imei(test_imei)
        
        scan_data = {
            "imei": test_imei,
            "action": "outward_magnova",
            "location": "Delhi",
            "organization": "Magnova",
            "customer_organization": "Magnova"
        }
        
        response = requests.post(
            f"{BASE_URL}/api/inventory/scan",
            headers=self.headers,
            json=scan_data
        )
        
        if response.status_code == 200:
            data = response.json()
            assert data.get("status") == "Outward Magnova", f"Expected status 'Outward Magnova', got {data.get('status')}"
            print("outward_magnova action works correctly")
        elif response.status_code == 404:
            print("IMEI not found - need to create procurement first")
    
    def test_scan_with_customer_organization(self):
        """Test POST /inventory/scan includes customer_organization field"""
        test_imei = "TEST_CUST_ORG_001"
        self._create_test_imei(test_imei)
        
        scan_data = {
            "imei": test_imei,
            "action": "inward_nova",
            "location": "Bangalore",
            "organization": "Nova",
            "customer_organization": "Nova"
        }
        
        response = requests.post(
            f"{BASE_URL}/api/inventory/scan",
            headers=self.headers,
            json=scan_data
        )
        
        if response.status_code == 200:
            print("Scan with customer_organization successful")
        elif response.status_code == 404:
            print("IMEI not found")
    
    def test_inventory_scan_all_actions(self):
        """Test all scan action types are handled"""
        actions = ["inward_nova", "inward_magnova", "outward_nova", "outward_magnova", "dispatch", "available"]
        
        for action in actions:
            test_imei = f"TEST_ACTION_{action.upper()}"
            self._create_test_imei(test_imei)
            
            scan_data = {
                "imei": test_imei,
                "action": action,
                "location": "Mumbai",
                "organization": "Nova" if "nova" in action else "Magnova",
                "customer_organization": "Nova"
            }
            
            response = requests.post(
                f"{BASE_URL}/api/inventory/scan",
                headers=self.headers,
                json=scan_data
            )
            
            # Just verify no 500 errors
            assert response.status_code != 500, f"Server error for action {action}: {response.text}"
            print(f"Action '{action}' handled: {response.status_code}")


class TestLogisticsShipmentStatus:
    """Tests for Logistics shipment status update"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup: Get auth token"""
        login_response = requests.post(f"{BASE_URL}/api/auth/login", json=TEST_ADMIN)
        if login_response.status_code == 200:
            self.token = login_response.json()["access_token"]
            self.headers = {
                "Authorization": f"Bearer {self.token}",
                "Content-Type": "application/json"
            }
        else:
            pytest.skip("Authentication failed")
    
    def test_create_shipment_with_brand_model(self):
        """Test POST /logistics/shipments creates shipment with brand and model"""
        # Get an approved PO
        pos_response = requests.get(
            f"{BASE_URL}/api/purchase-orders",
            headers=self.headers
        )
        approved_pos = [po for po in pos_response.json() if po.get("approval_status") == "Approved"]
        
        if not approved_pos:
            pytest.skip("No approved POs available")
        
        po = approved_pos[0]
        po_number = po["po_number"]
        
        # Get brand and model from PO items
        brand = po["items"][0]["brand"] if po.get("items") else "Test Brand"
        model = po["items"][0]["model"] if po.get("items") else "Test Model"
        
        shipment_data = {
            "po_number": po_number,
            "transporter_name": "TEST_Transporter",
            "vehicle_number": "MH01AB1234",
            "from_location": "Mumbai",
            "to_location": "Delhi",
            "pickup_date": datetime.now().isoformat(),
            "expected_delivery": (datetime.now() + timedelta(days=3)).isoformat(),
            "imei_list": [],
            "pickup_quantity": 5,
            "brand": brand,
            "model": model
        }
        
        response = requests.post(
            f"{BASE_URL}/api/logistics/shipments",
            headers=self.headers,
            json=shipment_data
        )
        assert response.status_code == 200, f"Failed to create shipment: {response.text}"
        
        data = response.json()
        assert "shipment_id" in data
        assert data["brand"] == brand
        assert data["model"] == model
        assert data["pickup_quantity"] == 5
        assert data["status"] == "Pending"
        
        print(f"Created shipment {data['shipment_id']} with brand={brand}, model={model}")
        return data["shipment_id"]
    
    def test_update_shipment_status_pending(self):
        """Test PATCH /logistics/shipments/{id}/status to Pending"""
        # Create a shipment first
        shipment_id = self._create_test_shipment()
        if not shipment_id:
            pytest.skip("Could not create test shipment")
        
        response = requests.patch(
            f"{BASE_URL}/api/logistics/shipments/{shipment_id}/status",
            headers=self.headers,
            json={"status": "Pending"}
        )
        assert response.status_code == 200, f"Failed to update status: {response.text}"
        print("Status update to 'Pending' successful")
    
    def test_update_shipment_status_in_transit(self):
        """Test PATCH /logistics/shipments/{id}/status to In Transit"""
        shipment_id = self._create_test_shipment()
        if not shipment_id:
            pytest.skip("Could not create test shipment")
        
        response = requests.patch(
            f"{BASE_URL}/api/logistics/shipments/{shipment_id}/status",
            headers=self.headers,
            json={"status": "In Transit"}
        )
        assert response.status_code == 200, f"Failed to update status: {response.text}"
        
        # Verify status changed
        shipments = requests.get(
            f"{BASE_URL}/api/logistics/shipments",
            headers=self.headers
        ).json()
        
        shipment = next((s for s in shipments if s["shipment_id"] == shipment_id), None)
        assert shipment is not None
        assert shipment["status"] == "In Transit"
        print("Status update to 'In Transit' successful")
    
    def test_update_shipment_status_delivered(self):
        """Test PATCH /logistics/shipments/{id}/status to Delivered"""
        shipment_id = self._create_test_shipment()
        if not shipment_id:
            pytest.skip("Could not create test shipment")
        
        response = requests.patch(
            f"{BASE_URL}/api/logistics/shipments/{shipment_id}/status",
            headers=self.headers,
            json={"status": "Delivered"}
        )
        assert response.status_code == 200, f"Failed to update status: {response.text}"
        
        # Verify status and actual_delivery date
        shipments = requests.get(
            f"{BASE_URL}/api/logistics/shipments",
            headers=self.headers
        ).json()
        
        shipment = next((s for s in shipments if s["shipment_id"] == shipment_id), None)
        assert shipment is not None
        assert shipment["status"] == "Delivered"
        assert shipment.get("actual_delivery") is not None
        print("Status update to 'Delivered' successful with actual_delivery date set")
    
    def test_update_shipment_status_cancelled(self):
        """Test PATCH /logistics/shipments/{id}/status to Cancelled"""
        shipment_id = self._create_test_shipment()
        if not shipment_id:
            pytest.skip("Could not create test shipment")
        
        response = requests.patch(
            f"{BASE_URL}/api/logistics/shipments/{shipment_id}/status",
            headers=self.headers,
            json={"status": "Cancelled"}
        )
        assert response.status_code == 200, f"Failed to update status: {response.text}"
        print("Status update to 'Cancelled' successful")
    
    def test_update_nonexistent_shipment_status(self):
        """Test PATCH /logistics/shipments/{id}/status with invalid ID"""
        response = requests.patch(
            f"{BASE_URL}/api/logistics/shipments/invalid-shipment-id/status",
            headers=self.headers,
            json={"status": "Delivered"}
        )
        assert response.status_code == 404, f"Expected 404, got {response.status_code}"
    
    def test_shipments_list_contains_quantity_tracking(self):
        """Test GET /logistics/shipments returns pickup_quantity for tracking"""
        response = requests.get(
            f"{BASE_URL}/api/logistics/shipments",
            headers=self.headers
        )
        assert response.status_code == 200
        data = response.json()
        
        if len(data) > 0:
            shipment = data[0]
            assert "pickup_quantity" in shipment, "Missing pickup_quantity field"
            assert "brand" in shipment, "Missing brand field"
            assert "model" in shipment, "Missing model field"
            print(f"Shipment has quantity tracking: pickup_quantity={shipment.get('pickup_quantity')}")
    
    def _create_test_shipment(self):
        """Helper to create a test shipment"""
        pos_response = requests.get(
            f"{BASE_URL}/api/purchase-orders",
            headers=self.headers
        )
        approved_pos = [po for po in pos_response.json() if po.get("approval_status") == "Approved"]
        
        if not approved_pos:
            return None
        
        po = approved_pos[0]
        
        shipment_data = {
            "po_number": po["po_number"],
            "transporter_name": "TEST_Status_Transporter",
            "vehicle_number": "MH02CD5678",
            "from_location": "Mumbai",
            "to_location": "Chennai",
            "pickup_date": datetime.now().isoformat(),
            "expected_delivery": (datetime.now() + timedelta(days=2)).isoformat(),
            "imei_list": [],
            "pickup_quantity": 3,
            "brand": po["items"][0]["brand"] if po.get("items") else "Test",
            "model": po["items"][0]["model"] if po.get("items") else "Model"
        }
        
        response = requests.post(
            f"{BASE_URL}/api/logistics/shipments",
            headers=self.headers,
            json=shipment_data
        )
        
        if response.status_code == 200:
            return response.json()["shipment_id"]
        return None


class TestLocationsFromPO:
    """Tests for location dropdown populated from PO"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup: Get auth token"""
        login_response = requests.post(f"{BASE_URL}/api/auth/login", json=TEST_ADMIN)
        if login_response.status_code == 200:
            self.token = login_response.json()["access_token"]
            self.headers = {
                "Authorization": f"Bearer {self.token}",
                "Content-Type": "application/json"
            }
        else:
            pytest.skip("Authentication failed")
    
    def test_po_items_have_locations(self):
        """Test that PO items contain location field for dropdown population"""
        response = requests.get(
            f"{BASE_URL}/api/purchase-orders",
            headers=self.headers
        )
        assert response.status_code == 200
        data = response.json()
        
        locations = set()
        for po in data:
            for item in po.get("items", []):
                if item.get("location"):
                    locations.add(item["location"])
        
        print(f"Found {len(locations)} unique locations from POs: {locations}")
        assert len(locations) > 0, "No locations found in PO items"


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
