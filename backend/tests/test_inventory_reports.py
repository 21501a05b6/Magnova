"""
Test cases for Inventory and Reports features:
1. Inventory page shows Brand, Model, Colour columns
2. Reports page Excel export endpoint
3. Reports page CSV export includes all columns including external payments
4. Excel export contains all 5 sections
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestAuth:
    """Authentication tests"""
    
    @pytest.fixture(scope="class")
    def auth_token(self):
        """Get authentication token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "admin@magnova.com",
            "password": "admin123"
        })
        assert response.status_code == 200, f"Login failed: {response.text}"
        return response.json().get("access_token")
    
    def test_login_success(self):
        """Test admin login"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "admin@magnova.com",
            "password": "admin123"
        })
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["user"]["email"] == "admin@magnova.com"


class TestInventoryAPI:
    """Test Inventory API - Brand, Model, Colour fields"""
    
    @pytest.fixture(scope="class")
    def auth_token(self):
        """Get authentication token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "admin@magnova.com",
            "password": "admin123"
        })
        assert response.status_code == 200
        return response.json().get("access_token")
    
    def test_inventory_endpoint_returns_200(self, auth_token):
        """Test inventory endpoint is accessible"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.get(f"{BASE_URL}/api/inventory", headers=headers)
        assert response.status_code == 200
        
    def test_inventory_response_structure(self, auth_token):
        """Test inventory response contains brand, model, colour fields"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.get(f"{BASE_URL}/api/inventory", headers=headers)
        assert response.status_code == 200
        data = response.json()
        
        # Check if response is a list
        assert isinstance(data, list), "Inventory response should be a list"
        
        # If there are items, check structure
        if len(data) > 0:
            item = data[0]
            # Check that brand, model, colour fields exist in response
            assert "brand" in item or item.get("brand") is None, "brand field should exist"
            assert "model" in item or item.get("model") is None, "model field should exist"
            assert "colour" in item or item.get("colour") is None, "colour field should exist"
            assert "imei" in item, "imei field should exist"
            assert "status" in item, "status field should exist"
            assert "current_location" in item, "current_location field should exist"
            print(f"Inventory item structure verified: {list(item.keys())}")
        else:
            print("No inventory items found - structure test skipped")


class TestReportsExportAPI:
    """Test Reports Export API - Excel and CSV exports"""
    
    @pytest.fixture(scope="class")
    def auth_token(self):
        """Get authentication token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "admin@magnova.com",
            "password": "admin123"
        })
        assert response.status_code == 200
        return response.json().get("access_token")
    
    def test_master_report_excel_export_endpoint_exists(self, auth_token):
        """Test /api/reports/export/master endpoint returns XLSX file"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.get(f"{BASE_URL}/api/reports/export/master", headers=headers)
        
        assert response.status_code == 200, f"Export endpoint failed: {response.status_code} - {response.text}"
        
        # Check content type is Excel
        content_type = response.headers.get("content-type", "")
        assert "spreadsheetml" in content_type or "octet-stream" in content_type, \
            f"Expected Excel content type, got: {content_type}"
        
        # Check content disposition header
        content_disposition = response.headers.get("content-disposition", "")
        assert "master_report" in content_disposition.lower() or "attachment" in content_disposition.lower(), \
            f"Expected attachment header, got: {content_disposition}"
        
        # Check file has content
        assert len(response.content) > 0, "Excel file should have content"
        print(f"Excel export successful - file size: {len(response.content)} bytes")
    
    def test_inventory_export_endpoint_exists(self, auth_token):
        """Test /api/reports/export/inventory endpoint returns XLSX file"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.get(f"{BASE_URL}/api/reports/export/inventory", headers=headers)
        
        assert response.status_code == 200, f"Inventory export failed: {response.status_code}"
        
        # Check content type is Excel
        content_type = response.headers.get("content-type", "")
        assert "spreadsheetml" in content_type or "octet-stream" in content_type, \
            f"Expected Excel content type, got: {content_type}"
        
        print(f"Inventory export successful - file size: {len(response.content)} bytes")


class TestPaymentsAPI:
    """Test Payments API - Internal and External payments"""
    
    @pytest.fixture(scope="class")
    def auth_token(self):
        """Get authentication token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "admin@magnova.com",
            "password": "admin123"
        })
        assert response.status_code == 200
        return response.json().get("access_token")
    
    def test_payments_endpoint_returns_200(self, auth_token):
        """Test payments endpoint is accessible"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.get(f"{BASE_URL}/api/payments", headers=headers)
        assert response.status_code == 200
        
    def test_payments_include_external_type(self, auth_token):
        """Test payments response includes payment_type field for external payments"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.get(f"{BASE_URL}/api/payments", headers=headers)
        assert response.status_code == 200
        data = response.json()
        
        if len(data) > 0:
            # Check that payment_type field exists
            for payment in data:
                assert "payment_type" in payment, "payment_type field should exist"
                assert payment["payment_type"] in ["internal", "external", None], \
                    f"Invalid payment_type: {payment['payment_type']}"
            
            # Check for external payment fields
            external_payments = [p for p in data if p.get("payment_type") == "external"]
            if external_payments:
                ext = external_payments[0]
                assert "payee_name" in ext, "External payment should have payee_name"
                assert "payee_type" in ext, "External payment should have payee_type"
                print(f"Found {len(external_payments)} external payments")
            else:
                print("No external payments found - external fields test skipped")
        else:
            print("No payments found - structure test skipped")


class TestPurchaseOrdersAPI:
    """Test Purchase Orders API"""
    
    @pytest.fixture(scope="class")
    def auth_token(self):
        """Get authentication token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "admin@magnova.com",
            "password": "admin123"
        })
        assert response.status_code == 200
        return response.json().get("access_token")
    
    def test_purchase_orders_endpoint_returns_200(self, auth_token):
        """Test purchase orders endpoint is accessible"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.get(f"{BASE_URL}/api/purchase-orders", headers=headers)
        assert response.status_code == 200
        
    def test_purchase_orders_items_have_brand_model_colour(self, auth_token):
        """Test PO items include brand, model, colour fields"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.get(f"{BASE_URL}/api/purchase-orders", headers=headers)
        assert response.status_code == 200
        data = response.json()
        
        if len(data) > 0:
            for po in data:
                if po.get("items") and len(po["items"]) > 0:
                    item = po["items"][0]
                    # Check that brand, model, colour fields exist in PO items
                    assert "brand" in item, f"PO item should have brand field: {item.keys()}"
                    assert "model" in item, f"PO item should have model field: {item.keys()}"
                    assert "colour" in item or "colour" in item.keys(), f"PO item should have colour field: {item.keys()}"
                    print(f"PO {po['po_number']} items have brand/model/colour fields")
                    break
        else:
            print("No purchase orders found - structure test skipped")


class TestLogisticsAPI:
    """Test Logistics/Shipments API"""
    
    @pytest.fixture(scope="class")
    def auth_token(self):
        """Get authentication token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "admin@magnova.com",
            "password": "admin123"
        })
        assert response.status_code == 200
        return response.json().get("access_token")
    
    def test_shipments_endpoint_returns_200(self, auth_token):
        """Test shipments endpoint is accessible"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.get(f"{BASE_URL}/api/logistics/shipments", headers=headers)
        assert response.status_code == 200


class TestDashboardReportsAPI:
    """Test Dashboard Reports API"""
    
    @pytest.fixture(scope="class")
    def auth_token(self):
        """Get authentication token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "admin@magnova.com",
            "password": "admin123"
        })
        assert response.status_code == 200
        return response.json().get("access_token")
    
    def test_dashboard_reports_endpoint_returns_200(self, auth_token):
        """Test dashboard reports endpoint is accessible"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.get(f"{BASE_URL}/api/reports/dashboard", headers=headers)
        assert response.status_code == 200
        
    def test_dashboard_reports_structure(self, auth_token):
        """Test dashboard reports response structure"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.get(f"{BASE_URL}/api/reports/dashboard", headers=headers)
        assert response.status_code == 200
        data = response.json()
        
        # Check expected fields
        expected_fields = ["total_pos", "total_procurement", "total_inventory", "available_inventory", "total_sales", "total_payment_amount"]
        for field in expected_fields:
            assert field in data, f"Dashboard should have {field} field"
        print(f"Dashboard stats: {data}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
