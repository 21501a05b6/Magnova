"""
Test file for Payments and Logistics feature changes:
1. Payments Page: External Payment form should show 'Payee Phone Number' field when Payee Type is 'CC'
2. Payments Page: Phone number should be stored and displayed in the external payments table
3. Logistics Page: New shipments should have 'In Transit' as default status (not 'Pending')
4. Backend API /api/payments/external should accept payee_phone field
"""
import pytest
import requests
import os
from datetime import datetime

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestAuth:
    """Authentication tests"""
    
    @pytest.fixture(scope="class")
    def auth_token(self):
        """Get authentication token for admin user"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "admin@magnova.com",
            "password": "admin123"
        })
        assert response.status_code == 200, f"Login failed: {response.text}"
        return response.json()["access_token"]
    
    def test_admin_login(self, auth_token):
        """Test admin login works"""
        assert auth_token is not None
        assert len(auth_token) > 0


class TestExternalPaymentWithPhone:
    """Test external payment API with payee_phone field"""
    
    @pytest.fixture(scope="class")
    def auth_token(self):
        """Get authentication token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "admin@magnova.com",
            "password": "admin123"
        })
        assert response.status_code == 200
        return response.json()["access_token"]
    
    @pytest.fixture(scope="class")
    def headers(self, auth_token):
        """Get headers with auth token"""
        return {
            "Authorization": f"Bearer {auth_token}",
            "Content-Type": "application/json"
        }
    
    @pytest.fixture(scope="class")
    def test_po_number(self, headers):
        """Get or create a test PO for payment testing"""
        # First try to get existing POs
        response = requests.get(f"{BASE_URL}/api/purchase-orders", headers=headers)
        assert response.status_code == 200
        pos = response.json()
        
        # Find an approved PO or any PO
        approved_pos = [po for po in pos if po.get("approval_status") == "Approved"]
        if approved_pos:
            return approved_pos[0]["po_number"]
        elif pos:
            return pos[0]["po_number"]
        
        # Create a new PO if none exist
        po_data = {
            "po_date": datetime.now().isoformat(),
            "purchase_office": "Test Office",
            "items": [{
                "sl_no": 1,
                "vendor": "Test Vendor",
                "location": "Test Location",
                "brand": "Test Brand",
                "model": "Test Model",
                "qty": 1,
                "rate": 10000.0,
                "po_value": 10000.0
            }],
            "notes": "Test PO for payment testing"
        }
        response = requests.post(f"{BASE_URL}/api/purchase-orders", json=po_data, headers=headers)
        if response.status_code == 201:
            return response.json()["po_number"]
        
        pytest.skip("No PO available for testing")
    
    def test_external_payment_api_accepts_payee_phone(self, headers, test_po_number):
        """Test that external payment API accepts payee_phone field for CC payments"""
        # First create an internal payment to allow external payment
        internal_payment = {
            "po_number": test_po_number,
            "payee_name": "Nova Enterprises",
            "payee_account": "TEST-ACC-001",
            "payee_bank": "HDFC Bank",
            "payment_mode": "Bank Transfer",
            "amount": 5000.0,
            "transaction_ref": "TEST-UTR-INT-001",
            "payment_date": datetime.now().isoformat()
        }
        response = requests.post(f"{BASE_URL}/api/payments/internal", json=internal_payment, headers=headers)
        # May fail if already exists, that's ok
        
        # Now create external payment with CC type and phone number
        external_payment = {
            "po_number": test_po_number,
            "payee_type": "cc",
            "payee_name": "Test CC Holder",
            "payee_phone": "9876543210",  # This is the new field being tested
            "account_number": "1234-5678-9012-3456",
            "ifsc_code": "HDFC Bank",
            "location": "Mumbai",
            "payment_mode": "Bank Transfer",
            "amount": 1000.0,
            "utr_number": f"TEST-UTR-EXT-{datetime.now().timestamp()}",
            "payment_date": datetime.now().isoformat()
        }
        
        response = requests.post(f"{BASE_URL}/api/payments/external", json=external_payment, headers=headers)
        
        # Check response
        assert response.status_code in [200, 201], f"External payment creation failed: {response.text}"
        
        payment_data = response.json()
        assert "payment_id" in payment_data, "Response should contain payment_id"
        assert payment_data.get("payee_phone") == "9876543210", f"payee_phone should be stored. Got: {payment_data.get('payee_phone')}"
        assert payment_data.get("payee_type") == "cc", "payee_type should be 'cc'"
        
        return payment_data["payment_id"]
    
    def test_external_payment_vendor_no_phone(self, headers, test_po_number):
        """Test that vendor payments don't require phone number"""
        external_payment = {
            "po_number": test_po_number,
            "payee_type": "vendor",
            "payee_name": "Test Vendor",
            "payee_phone": "",  # Empty phone for vendor
            "account_number": "1234567890",
            "ifsc_code": "HDFC0001234",
            "location": "Delhi",
            "payment_mode": "NEFT",
            "amount": 500.0,
            "utr_number": f"TEST-UTR-VENDOR-{datetime.now().timestamp()}",
            "payment_date": datetime.now().isoformat()
        }
        
        response = requests.post(f"{BASE_URL}/api/payments/external", json=external_payment, headers=headers)
        
        # Should succeed even without phone for vendor type
        assert response.status_code in [200, 201], f"Vendor payment creation failed: {response.text}"
        
        payment_data = response.json()
        assert payment_data.get("payee_type") == "vendor"
    
    def test_payments_list_includes_phone(self, headers):
        """Test that payments list includes payee_phone field"""
        response = requests.get(f"{BASE_URL}/api/payments", headers=headers)
        assert response.status_code == 200
        
        payments = response.json()
        
        # Find external CC payments
        cc_payments = [p for p in payments if p.get("payee_type") == "cc"]
        
        if cc_payments:
            # Check that payee_phone field exists in response
            for payment in cc_payments:
                assert "payee_phone" in payment, "payee_phone field should be in payment response"
                print(f"CC Payment found with phone: {payment.get('payee_phone')}")


class TestLogisticsDefaultStatus:
    """Test logistics shipment default status is 'In Transit' not 'Pending'"""
    
    @pytest.fixture(scope="class")
    def auth_token(self):
        """Get authentication token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "admin@magnova.com",
            "password": "admin123"
        })
        assert response.status_code == 200
        return response.json()["access_token"]
    
    @pytest.fixture(scope="class")
    def headers(self, auth_token):
        """Get headers with auth token"""
        return {
            "Authorization": f"Bearer {auth_token}",
            "Content-Type": "application/json"
        }
    
    @pytest.fixture(scope="class")
    def test_po_number(self, headers):
        """Get a PO for shipment testing"""
        response = requests.get(f"{BASE_URL}/api/purchase-orders", headers=headers)
        assert response.status_code == 200
        pos = response.json()
        
        if pos:
            return pos[0]["po_number"]
        pytest.skip("No PO available for testing")
    
    def test_new_shipment_has_in_transit_status(self, headers, test_po_number):
        """Test that new shipments are created with 'In Transit' status by default"""
        shipment_data = {
            "po_number": test_po_number,
            "transporter_name": "Test Transporter",
            "vehicle_number": "MH01AB1234",
            "from_location": "Mumbai",
            "to_location": "Delhi",
            "pickup_date": datetime.now().isoformat(),
            "expected_delivery": datetime.now().isoformat(),
            "imei_list": [],
            "pickup_quantity": 5,
            "brand": "Test Brand",
            "model": "Test Model",
            "vendor": "Test Vendor"
        }
        
        response = requests.post(f"{BASE_URL}/api/logistics/shipments", json=shipment_data, headers=headers)
        
        assert response.status_code in [200, 201], f"Shipment creation failed: {response.text}"
        
        shipment = response.json()
        assert "shipment_id" in shipment, "Response should contain shipment_id"
        
        # KEY TEST: Default status should be 'In Transit', NOT 'Pending'
        assert shipment.get("status") == "In Transit", f"Default status should be 'In Transit', got: {shipment.get('status')}"
        
        print(f"✓ New shipment created with status: {shipment.get('status')}")
        
        return shipment["shipment_id"]
    
    def test_shipment_status_update_options(self, headers):
        """Test that shipment status can be updated to valid statuses (not Pending)"""
        # Get existing shipments
        response = requests.get(f"{BASE_URL}/api/logistics/shipments", headers=headers)
        assert response.status_code == 200
        
        shipments = response.json()
        if not shipments:
            pytest.skip("No shipments available for testing")
        
        shipment = shipments[0]
        shipment_id = shipment["shipment_id"]
        
        # Test updating to 'Delivered' status
        response = requests.patch(
            f"{BASE_URL}/api/logistics/shipments/{shipment_id}/status",
            json={"status": "Delivered"},
            headers=headers
        )
        assert response.status_code == 200, f"Status update failed: {response.text}"
        
        # Verify the update
        response = requests.get(f"{BASE_URL}/api/logistics/shipments", headers=headers)
        updated_shipment = next((s for s in response.json() if s["shipment_id"] == shipment_id), None)
        assert updated_shipment is not None
        assert updated_shipment["status"] == "Delivered"
        
        # Reset back to In Transit for other tests
        requests.patch(
            f"{BASE_URL}/api/logistics/shipments/{shipment_id}/status",
            json={"status": "In Transit"},
            headers=headers
        )


class TestPaymentsSummary:
    """Test payment summary endpoint"""
    
    @pytest.fixture(scope="class")
    def auth_token(self):
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "admin@magnova.com",
            "password": "admin123"
        })
        assert response.status_code == 200
        return response.json()["access_token"]
    
    @pytest.fixture(scope="class")
    def headers(self, auth_token):
        return {
            "Authorization": f"Bearer {auth_token}",
            "Content-Type": "application/json"
        }
    
    def test_payment_summary_endpoint(self, headers):
        """Test payment summary endpoint works"""
        # Get a PO number first
        response = requests.get(f"{BASE_URL}/api/purchase-orders", headers=headers)
        assert response.status_code == 200
        pos = response.json()
        
        if not pos:
            pytest.skip("No POs available")
        
        po_number = pos[0]["po_number"]
        
        response = requests.get(f"{BASE_URL}/api/payments/summary/{po_number}", headers=headers)
        assert response.status_code == 200
        
        summary = response.json()
        assert "po_number" in summary
        assert "internal_paid" in summary
        assert "external_paid" in summary
        assert "external_remaining" in summary


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
